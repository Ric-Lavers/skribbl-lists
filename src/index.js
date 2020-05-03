// console.log("here");
// console.log("XState", XState);
// console.log("React", React);
// import fetchListMachine from './machines/fetchMachine'

const { createMachine, interpret } = XState;

const fetchListService = interpret(fetchListMachine)
  .onTransition((state) => {
    // console.log("onTransition", state.value, state);
    if (state.changed) {
      // console.log(state)
      console.log(state.value, state.context);
    }
  })
  .start();

window["service"] = fetchListService;

const addWordButton = document.getElementById("add-word-to-group");
const copyListButton = document.getElementById("copy-list");

addWordButton.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = document.getElementById("new-word").value.trim();

  fetchListService.send({
    type: "POST_WORD",
    word,
  });
});

copyListButton.addEventListener("click", (event) => {
  event.preventDefault();
  fetchListService.send("GET_LIST");
});

/* 










*/
// const increment = (context) => {
//   console.log("increment");
//   return context.count + 1;
// };
// const decrement = (context) => {
//   console.log("decrement");
//   return context.count - 1;
// };
// const counterMachine = Machine(
//   {
//     initial: "inactive",
//     context: {
//       count: 9,
//     },
//     states: {
//       inactive: {
//         invoke: {
//           id: "fetch-group",
//           autoForward: true,
//           src: "invokeGetWordByGroup",
//           /*src:
//              () => {
//             return new Promise((res) =>
//               setTimeout(() => {
//                 res("data");
//               }, 500)
//             );
//           } */
//           onDone: {
//             target: "active",
//             actions: assign((context, event) => {
//               console.log(event.data);
//             }),
//           },
//           onError: {
//             target: "active",
//           },
//         },
//       },
//       active: {
//         on: {
//           INC: {
//             actions: assign({
//               count: increment,
//             }),
//           },
//           DEC: {
//             actions: assign({
//               count: decrement,
//             }),
//           },
//         },
//       },
//     },
//   },
//   {
//     services: {
//       invokeGetWordByGroup: ({ groupName }, event) => getWordByGroup(groupName),
//     },
//   }
// );

// const counterService = interpret(fetchListMachine)
//   .onTransition((state) => console.log(state.context))
//   .start();
// // ...

// // assume context is { count: 9 }
// counterService.send("INC");
// // => 10

// counterService.send("INC");
