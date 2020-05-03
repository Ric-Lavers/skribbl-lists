// https://xstate.js.org/viz/?gist=469032a40c65d4f2532d4838c4191c9a&groupName=test
const { assign, Machine } = XState;

const getGroupName = location.hash && location.hash.slice(1);
const getWordByGroup = (groupName = "test") => {
  return fetch(
    `http://localhost:8080/skibbl/group-words?groupName=${groupName}`
  ).then((response) => response.json());
};

const addWord = (word, groupName) => {
  return fetch(
    `http://localhost:8080/skibbl/custom-words?groupName=${groupName}`,
    {
      method: "POST",
      body: JSON.stringify({
        word,
      }),
    }
  ).then((response) => response.json());
};
async function copy(txt) {
  if (!navigator.clipboard) return;

  try {
    await navigator.clipboard.writeText(txt);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
}

const newGroup = {
  initial: "idle",
  states: {
    idle: {
      on: {
        NEW_GROUP: {
          target: "done",
          actions: (ctx, { groupName }) => {
            console.log(`redirect to ${groupName}`);
          },
        },
      },
    },
    done: {
      type: "final",
    },
  },
};

const entering = {
  initial: "idle",
  states: {
    idle: {
      on: {
        POST_WORD: {
          target: "loading",
          actions: assign((context, { word }) => {
            return {
              word,
            };
          }),
        },
      },
    },
    loading: {
      invoke: {
        id: "fetch-group",
        autoForward: true,
        src: "invokeAddWordToGroup",
        onDone: {
          target: "idle",
          actions: "reset",
        },
        onError: {
          target: "failure",
          actions: assign(({ failCount }) => {
            return {
              failCount: failCount + 1,
            };
          }),
        },
      },
    },

    failure: {
      on: {
        "": [
          {
            target: "loading",
            cond: ({ failCount }) => failCount < 3,
          },
          {
            target: "#skibbl.error",
            cond: ({ failCount }) => failCount >= 3,
          },
        ],
      },
    },
    done: {
      type: "final",
    },
  },
};

const intitalFetch = {
  invoke: {
    id: "fetch-group",
    autoForward: true,
    src: "invokeGetWordByGroup",
    onDone: {
      target: "entering",
      actions: assign((context, event) => {
        return {
          words: event.data,
        };
      }),
    },
    onError: {
      target: "error",
    },
  },
};

const listToClipBoard = {
  initial: "loading",
  states: {
    loading: {
      invoke: {
        src: "invokeGetWordByGroup",
        onDone: {
          target: "onClipBoard",
          actions: assign((context, event) => {
            console.log(event.data);

            copy(event.data.toString());
          }),
        },
        onError: {
          target: "#skibbl.error",
        },
      },
    },
    onClipBoard: {
      type: "final",
    },
  },
};

var fetchListMachine = Machine(
  {
    id: "skibbl",
    initial: "intitalFetch",
    context: {
      failCount: 0,
      word: "",
      words: [],
      groupName: getGroupName || "test",
    },
    states: {
      intitalFetch,
      error: {
        type: "final",
      },
      entering,
      newGroup,
      listToClipBoard,
    },
    on: {
      NEW_GROUP: "newGroup",
      GET_LIST: "listToClipBoard",
    },
  },
  {
    services: {
      invokeGetWordByGroup: ({ groupName }, event) => getWordByGroup(groupName),
      invokeAddWordToGroup: ({ groupName }, { word }) =>
        addWord(word, groupName),
    },
    actions: {
      reset: assign((context, event) => {
        return {
          word: "",
          words: event.data,
        };
      }),
    },
  }
);