import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { fetchEmployeeThunk, editEmployeeThunk, fetchAllTasksThunk, editTaskThunk } from '../../store/thunks';

class EditEmployeeContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
          firstname: "", 
          lastname: "",
          department: "",
          tasks:[], 
          employeeId: null, 
          redirect: false, 
          redirectId: null,
          error: ""
        };
    }


    componentDidMount() {
      this.props.fetchEmployee(this.props.match.params.id);
      this.props.fetchTasks();
      this.setState({
        firstname: this.props.employee.firstname,
        lastname: this.props.employee.lastname,
        department: this.props.employee.department,
        tasks: this.props.employee.tasks,
        employeeId: this.props.employee.employeeId,
      });
    }


    componentDidUpdate(props) {
      if (props.employee !== this.props.employee) {
        // Fetch the updated employee data
        this.props.fetchEmployee(this.props.match.params.id);
      }
    }
    

    handleChange = event => {
      this.setState({
        [event.target.name]: event.target.value
      });
    }

    handleSelectChange = event => {
      //handle change for the dropdown menu
      //want to set the instructorId based on the selected choice
      //when the form gets submitted, this is how we can change
      //assigned instructor without having to manually enter in the 
      //instructorId like before
      this.setState({ employeeId: event.target.value });
      
    }

    handleSubmit = event => {
        event.preventDefault();
        //implementing form validation
        if (this.state.firstname === "") {
          this.setState({error: "Error: firstname cannot be empty"});
          return;
        }
        if (this.state.lastname === "") {
          this.setState({error: "Error: lastname cannot be empty"});
          return;
        }
        if (this.state.department === "") {
          this.setState({ error: "Error: department cannot be empty" });
          return;
        }
          //get new info for course from form input
        let employee = {
          id: this.props.employee.id,
          firstname: this.state.firstname, 
          lastname: this.state.lastname,
          department: this.state.department,
          tasks : this.state.tasks,
          employeeId: this.state.employeeId
        };


        this.props.editTask({ id: employee.employeeId, employeeId: employee.id });
        this.props.editEmployee(employee);
  

        this.setState({
          redirect: true, 
          redirectId:  this.props.employee.id
        });

    }
    

    componentWillUnmount() {
        this.setState({redirect: false, redirectId: null});

    }

    render() {
        let { employee, allTasks, editTask, fetchEmployee } = this.props;
        // change assignedTask to be a array of tasks assign to the selected employee
        let assignedTask = employee.tasks;
        let otherTasks = allTasks.filter(task => {
          return !assignedTask.some(assignedTaskItem => assignedTaskItem.id === task.id);
        });

      
      
        //go to single course view of the edited course
        if(this.state.redirect) {
          return (<Redirect to={`/employee/${this.state.redirectId}`}/>)
        }

        return (
        <div>
        <form style={{textAlign: 'center'}} onSubmit={(e) => this.handleSubmit(e)}>
            <label style= {{color:'#11153e', fontWeight: 'bold'}}>First Name: </label>
            <input type="text" name="firstname" value={this.state.firstname || ''} placeholder={employee.firstname} onChange ={(e) => this.handleChange(e)}/>
            <br/>

            <label style={{color:'#11153e', fontWeight: 'bold'}}>Last Name: </label>
            <input type="text" name="lastname" value={this.state.lastname || ''} placeholder={employee.lastname} onChange={(e) => this.handleChange(e)}/>
            <br/>


            <label style={{color:'#11153e', fontWeight: 'bold'}}>Department: </label>
            <input type="text" name="department" value={this.state.department || ''} placeholder={employee.department} onChange={(e) => this.handleChange(e)}/>
            <br/>
            
            <select onChange={(e) => this.handleSelectChange(e)}>
              {assignedTask.length === 0 && <option value="">-- Select a task --</option>}
              {employee.tasks !== null && (employee.tasks.map(task => (
                <option value={task.id} key={task.id}>
                  {task.description +  " (current)"}
                </option>
              )))}
              {otherTasks.map(task => { 
                return (
                  <option value={task.id} key={task.id}> {task.description}</option>
                );
              })}
            </select>
            <button type="submit">
              Submit
            </button>

          </form>

          { this.state.error !=="" && <p>{this.state.error}</p> }

          {/* // display the employees current tasks */}
          {assignedTask.length !== 0 ? (
            <div>
            Current Tasks:
              {assignedTask.map(task => {
                return (
                  <div key={task.id}>
                    <Link to={`/task/${task.id}`}>
                      <h4>{task.description}</h4>
                    </Link>
                    <button onClick={async () => {await editTask({id:task.id, employeeId: null});  fetchEmployee(employee.id)}}>Unassign</button>

                  </div>
                );
              })}
            </div>
          ) : (
          <div>No Task currently assigned</div>
        )}
          <div> Other Tasks
          {otherTasks.map(task => {
            return (
            <div key={task.id}>
                <Link to={`/task/${task.id}`}>
                  <h4>{task.description}</h4>
                </Link>
                <button onClick={async() => {await editTask({id:task.id, employeeId: employee.id}); fetchEmployee(employee.id)}}>Assign this task</button>
            </div>
            )})
          }
          </div>
        </div>
        )
    }
}

// map state to props
const mapState = (state) => {
    return {
      employee: state.employee,
      allTasks: state.allTasks
    };
  };

const mapDispatch = (dispatch) => {
    return({
        editTask: (task) => dispatch(editTaskThunk(task)),
        editEmployee: (employee) => dispatch(editEmployeeThunk(employee)),
        fetchEmployee: (id) => dispatch(fetchEmployeeThunk(id)),
        fetchTasks: () => dispatch(fetchAllTasksThunk()),


    })
}

export default connect(mapState, mapDispatch)(EditEmployeeContainer);



