const {
  createMachine,
  interpret
} = XState;


const groupNameEl = document.getElementById("group-name");
const addWordForm = document.getElementById("add-word-to-group");
const input = addWordForm.querySelector('input[type="text"]');
const submit = addWordForm.querySelector('input[type="submit"]');

const copyListButton = document.getElementById("copy-list");
const numOfEntriesEl = document.getElementById("num-of-entires");

function setGroupName(name) {
  if (groupNameEl.innerText !== name) {
    groupNameEl.innerText = name;
  }
}

function setNumOfEntries(length) {
  if (numOfEntriesEl.innerText !== length) {
    numOfEntriesEl.innerText = length;
  }
}

const fetchListService = interpret(fetchListMachine)
  .onTransition((state) => {
    ;
    if (
      state.matches({
        entering: "idle",
      })
    ) {
      const {
        words,
        groupName
      } = state.context;
      setGroupName(groupName);
      setNumOfEntries(words.length);
      input.value = "";
    }

    submit.toggleAttribute(
      "disabled",
      state.matches({
        entering: "loading",
      })
    );

    if (state.changed) {
      // console.log(state)
      // console.log(state.value, state.context);
    }
  })
  .start();

window["service"] = fetchListService;

addWordForm.addEventListener("submit", async (event) => {
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

const newGroupForm = document.getElementById("new-group");
const addGroupForm = document.getElementById("add-group_form");
const newGroupInput = document.getElementById("new-group__input");

newGroupForm.addEventListener("click", (event) => {
  event.preventDefault();
  addGroupForm.style.display = addGroupForm.style.display === "none" ? "block" : "none";
});

addGroupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchListService.send({
    type: "NEW_GROUP",
    groupName: newGroupInput.value,
  });
});