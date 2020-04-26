import {
  SERVER_URL
} from '../constants'

export const getWordByGroup = (groupName = "test") => {

  fetch(`http://localhost:8080/skibbl/group-words?groupName=${groupName}`)
    .then((response) => response.json())
    .then((d) => {
      console.log("d", d)
      return d
    })
    .catch(err => console.error(err.message))
}