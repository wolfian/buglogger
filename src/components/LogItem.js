import React from 'react'
import Moment from 'react-moment'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

const LogItem = (props) => {

    const setVariant = (priority) => {
        if (priority === 'high') return 'danger';
        else if (priority === 'moderate') return 'warning';
        else return 'success';
    }
    return (
        <tr>
            <td>
                <Badge variant={setVariant(props.log.priority)} className='p-2'>{props.log.priority.charAt(0).toUpperCase() + props.log.priority.slice(1)}</Badge>
            </td>
            <td>{props.log.text}</td>
            <td>{props.log.user}</td>
            <td>
                <Moment format='MMMM Do YYYY, h:mm:ss a'>{new Date(props.log.created)}</Moment>    
            </td>
            <td>
                <Button variant='danger' size='sm' onClick={() => props.deleteItem(props.log._id)}>x</Button>
            </td>
        </tr>
    )
}

export default LogItem