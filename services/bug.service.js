import fs from 'fs'
import { utilService } from "./utils.service.js";


export const bugService = {
  query,
  getById,
  remove,
  save
}

const PAGE_SIZE = 3
const bugs = utilService.readJsonFile('data/bug.json')

function query(filterBy = {}, sortBy, sortDir) {
    let bugsToReturn = bugs
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regExp.test(bug.title) || regExp.test(bug.description))
    }
    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    if (filterBy.label) {
        bugsToReturn = bugsToReturn.filter(bug => bug.labels.includes(filterBy.label))
    }
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }
    if (sortBy === 'severity') { 
        bugsToReturn.sort((b1, b2) => (b1.severity - b2.severity) * sortDir)
    }
    else if (sortBy === 'createdAt') { 
        bugsToReturn.sort((b1, b2) => (b1.createdAt - b2.createdAt) * sortDir)
    }
    else if (sortBy === 'title') { 
        bugsToReturn.sort((b1, b2) => (b1.title.localeCompare(b2.title) * sortDir))
    }
    const maxPage = Math.ceil(bugsToReturn.length / PAGE_SIZE)
    return Promise.resolve({ bugs: bugsToReturn, maxPage })
}

function getById(bugId) {
  const bug = bugs.find(bug => bug._id === bugId)
  if (!bug) return Promise.reject('bug dosent exist!')
  
  return Promise.resolve(bug)
}

function remove(bugId) {
  const bugIdx = bugs.findIndex(bug => bug._id === bugId)
  bugs.splice(bugIdx, 1)
  return _saveBagsToFile()
}

function save(bug) {
  if (bug._id) {
      const bugIdx = bugs.findIndex(currBug => currBug._id === bug._id)
      
      bugs[bugIdx] = bug
  } else {
      bug._id = utilService.makeId()
      bug.createdAt = Date.now()
      bugs.unshift(bug)
  }
  

  return _saveBagsToFile().then(() => bug)
}


function _saveBagsToFile() {
  return new Promise((resolve, reject) => {
      const data = JSON.stringify(bugs, null, 2)
      fs.writeFile('data/bug.json', data, (err) => {
          if (err) {
              console.log(err)
              return reject(err)
          }
          resolve()
      })
  })
}