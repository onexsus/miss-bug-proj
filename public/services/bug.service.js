
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
}


function query(filterBy, sortBy = 'severity', sortDir = 1) {
    return axios.get(BASE_URL, { params: { ...filterBy, sortBy, sortDir } })
        .then(res => {
            console.log('res.data',res.data)
            return res.data
        })
}
function getById(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    // return storageService.remove(STORAGE_KEY, bugId)
    return axios.delete(BASE_URL + bugId)
}

function save(bug) {
    // if (bug._id) {
    //     return storageService.put(STORAGE_KEY, bug)
    // } else {
    //     return storageService.post(STORAGE_KEY, bug)
    // }
    // const url = BASE_URL + 'save'
    // let queryParams = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`
    // if (bug._id) queryParams += `&_id=${bug._id}`
    // return axios.get(url + queryParams)
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL, bug).then(res => res.data)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: '', label: '', pageIdx: 0 }
}




function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }



}
