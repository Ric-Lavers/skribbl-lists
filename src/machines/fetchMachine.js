// https://xstate.js.org/viz/?gist=469032a40c65d4f2532d4838c4191c9a&groupName=test
const {
  assign,
  Machine
} = XState;
const base_url = "https://req-body.ric-lavers.now.sh";
// const base_url = "http://localhost:3000";

function checkForError(res) {
  if (res.status >= 400 && res.status < 600) {
    throw res.json();
  }
}

var getGroupName = location.hash && location.hash.slice(2);

const getWordByGroup = (groupName = "test") => {
  return fetch(
    `${base_url}/api/groups/getWordsByGroup?groupName=${groupName}`
  ).then((res) => {
    checkForError(res);
    return res.json();
  });
};

const addWord = (word, groupName) => {
  return fetch(
    `${base_url}/api/words/addWord?groupName=${groupName}`, {
      method: "POST",
      body: JSON.stringify({
        word,
      }),
    }
  ).then((res) => {
    checkForError(res);
    return res.json();
  });
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
        "": {
          target: "done",
          actions: (ctx, {
            groupName
          }) => {
            location.hash = `/${groupName}`;
            location.reload();
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
          actions: assign((context, {
            word
          }) => {
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

        },
      },
    },

    failure: {
      on: {
        "": [{
            target: "idle",
            cond: ({
              failCount
            }) => failCount < 3,
          },
          {
            target: "#skibbl.error",
            cond: ({
              failCount
            }) => failCount >= 3,
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

var fetchListMachine = Machine({
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
}, {
  services: {
    invokeGetWordByGroup: ({
      groupName
    }, event) => getWordByGroup(groupName),
    invokeAddWordToGroup: ({
        groupName
      }, {
        word
      }) =>
      addWord(word, groupName),
  },
  actions: {
    reset: assign((context, event) => {
      return {
        word: "",
        words: event.data.words,
      };
    }),
  },
});

const obj = {
  a: 1,
  b: 2
}