import { Machine, assign } from "Xstate";

import { getWordByGroup } from "../services";
import { getGroupName } from "../utils";

const getGroupName = location.hash && location.hash.slice(1);
const getWordByGroup = (groupName = "test") => {
  return fetch(
    `http://localhost:8080/skibbl/group-words?groupName=${groupName}`
  )
    .then((response) => response.json())
    .catch((err) => console.error(err.message));
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
  )
    .then((response) => response.json())
    .catch((err) => console.error(err.message));
};

const newGroup = {
  initial: "idle",
  states: {
    idle: {},
    loading: {},
  },
};

const entering = {
  initial: "idle",
  states: {
    idle: {
      on: {
        FETCH: {
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
          actions: assign((context, event) => {
            return {
              word: "",
              words: event.data,
            };
          }),
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
        "": {
          target: "loading",
          cond: ({ failCount }) => failCount < 3,
        },
      },
    },
    done: {
      type: "final",
    },
  },
};

const fetchListsMachine = Machine(
  {
    id: "fetch",
    initial: "idle",
    context: {
      failCount: 0,
      word: "",
      words: [],
      groupName: getGroupName || "test",
    },
    states: {
      idle: {
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
            target: "newGroup",
          },
        },
      },
      newGroup,
      entering,
      error: {
        type: "final",
      },
    },
  },
  {
    services: {
      invokeGetWordByGroup: ({ groupName }, event) => getWordByGroup(groupName),
      invokeAddWordToGroup: ({ groupName }, { word }) =>
        addWord(word, groupName),
    },
  }
);
