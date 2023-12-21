
const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM


import { userService } from "../services/user.service.js";
import { showErrorMsg } from '../services/event-bus.service.js'


export function UserDetails(){

  const [users, setUsers] = useState(userService.getUsers())

    useEffect(() => {
      userService.getUsers().then(users=>{
        console.log(users)
        setUsers(users)
      })
            .catch(err => {
                showErrorMsg('Cannot load users')
            })
    }, [])

    function onRemoveUser(userId){
      userService.removeUser(userId)
      .then(() => {
          console.log('Deleted Succesfully!')
          const usersToUpdate = users.filter((user) => user._id !== userId)
          setUsers(usersToUpdate)
          showSuccessMsg('User removed')
      })
      .catch((err) => {
          console.log('Error from onRemoveUser ->', err)
          showErrorMsg('Cannot remove user')
      })
    }

    return(
        <div>
        <h3>Users Details</h3>
        <Link to="/bug">Back to List</Link>
        <ul className="users-list">
            {users.map((user) => (
                <li className="user-preview" key={user._id}>      
                    <div>
                      <h3>User Name : <span>{user.username} </span></h3>
                      <h3>Fullname : <span>{user.fullname}</span></h3>
                    </div>
                    <div>
                        <button onClick={() => onRemoveUser(user._id)}>x</button>
                    </div>
                </li>
            ))
            }
        </ul >
    </div>
    )
}