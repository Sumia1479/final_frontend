import { Link } from "react-router-dom";

const TaskView = (props) => {
  const { task } = props;
  return (
    <div>
      <h1>{task.description}</h1>
      {task.employee ? <Link to={`/employee/${task.employee.id}`}>
      {<h3>{task.employee.firstname + " " + task.employee.lastname}</h3>} </Link> : <h3>staff</h3>}
      
      <Link to={`/edittask/${task.id}`}>Edit task information</Link>
      <br/>
      <Link to={`/tasks`}>View all tasks</Link>
    </div>
  );

};

export default TaskView;