import { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { fetchTaskThunk, editTaskThunk, fetchAllEmployeesThunk  } from '../../store/thunks';


/*
IMPORTANT: comments regarding implementation details!!
=====================================================
You'll see that we have two ways of interacting with the UI
in order to change the course's instructor

The dropdown menu is straighforward, it's pretty much the same 
as having the input field for the instructorId but allows us
to actually see the available insutrctors as well as their names, 
not just their IDs. We did have to connect to the allInstructors state
from the Redux store, as well as fetchAllInstructors in componentDidMount().
This was done so we could get the other instructors in the database.
We filter out the current instructor from the array at the beginning of 
the render function, and use this array to populate the dropdown menu
options. Because it's part of the form, we don't need to modify the 
handleSubmit function. On redirect to the CourseView we will see the 
updates.

You will see below the form there is another part of the UI that is
also changing the current course's instructor. This structure is similar
to how changing assigned courses is done in the InstrutcorView. There is
a slight drawback to using this approach in this context. When we perform
an EDIT_COURSE action (initiated by calling the editCourseThunk), this action
is sent to the allCourses reducer, not the course reducer. For that reason, 
we will not see the updates in the single course view unless there is another 
call to the fetchCourseThunk. This is done once when we redirect after form
submission, which is why the data is shown without needing to refresh. 
If we want that same functionality within the container, we need to make
a call to fetchCourse after each editCourse. We see that in the onClick
functionality of the buttons controlling that portion of the UI. 

*/

class EditTaskContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
          description: "", 
          priority: "",
          isComplete: false,
          employee:{},
          employeeId: null, 
          redirect: false, 
          redirectId: null,
          error: ""
        };
    }

    componentDidMount() {
        //getting course ID from url
        this.props.fetchTask(this.props.match.params.id);
        this.props.fetchEmployees();
        this.setState({
            description: this.props.task.description, 
            priority: this.props.task.priority,
            isComplete: this.props.task.isComplete,
            employee: this.props.task.employee,
            employeeId: this.props.task.employeeId, 
        });
      }

      // so the changes appear on the task page after it redirects to it, i.e., the descritption updates
      componentDidUpdate(prevProps) {
        // Check if the task data has been updated
        if (prevProps.task !== this.props.task) {
          const { description, priority, isComplete, employee, employeeId } = this.props.task;
          this.setState({ description, priority, isComplete, employee, employeeId });
        }
      }
      
        

    handleChange =  event => {
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
      if (event.target.value === "employee") {
        this.setState({employeeId:null});
      } else {
        this.setState({employeeId: event.target.value})
      }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        //implementing form validation
        if (this.state.description === "") {
          this.setState({error: "Error: description cannot be empty"});
          return;
        }
        if (this.state.priority === "") {
          this.setState({error: "Error: priority cannot be empty"});
          return;
        }
        if (this.state.isComplete === "") {
          this.setState({ error: "Error: isComplete cannot be empty" });
          return;
        }

         // Check if isComplete is a valid boolean value
         if (this.state.isComplete !== "true" && this.state.isComplete !== "false") {
          this.setState({ error: "Error: isComplete should be true or false only" });
          return;
        }

        //get new info for course from form input
        let task = {
          id: this.props.task.id,
          description: this.state.description,
          priority: this.state.priority,
          isComplete: this.state.isComplete,
          employee: this.state.employee,
          employeeId: this.state.employeeId,
        };
        
        await this.props.editTask(task);
        // await this.props.fetchTask(task.id);


        this.setState({
          redirect: true, 
          redirectId: this.props.task.id
        });

    }

    componentWillUnmount() {
        this.setState({redirect: false, redirectId: null});

    }

    render() {
        let { task, allEmployees, editTask, fetchTask} = this.props;
        let assignedEmployee = task.employeeId;

        let otherEmployees = allEmployees.filter(employee => employee.id!==assignedEmployee);
      
        //go to single course view of the edited course
        if(this.state.redirect) {
          return (<Redirect to={`/task/${this.state.redirectId}`}/>)
        }

        return (
        <div>
        <form style={{textAlign: 'center'}} onSubmit={(e) => this.handleSubmit(e)}>
            <label style= {{color:'#11153e', fontWeight: 'bold'}}>Task Description: </label>
            <input type="text" name="description" value={this.state.description || ''} placeholder={task.description} onChange ={(e) => this.handleChange(e)}/>
            <br/>

            <label style={{color:'#11153e', fontWeight: 'bold'}}>Priority: </label>
            <input type="text" name="priority" value={this.state.priority || ''} placeholder={task.priority} onChange={(e) => this.handleChange(e)}/>
            <br/>


            <label style={{color:'#11153e', fontWeight: 'bold'}}>isComplete: </label>
            <input type="text" name="isComplete" value={this.state.isComplete || ''} placeholder={task.isComplete.toString()} onChange={(e) => this.handleChange(e)}/>
            <br/>

            <select onChange={(e) => this.handleSelectChange(e)}>
              {task.employee!==null ?
                <option value={task.employeeId}>{task.employee.firstname+" (current)"}</option>
              : <option value="employee">Employee</option>
              }
              {otherEmployees.map(employee => {
                return (
                  <option value={employee.id} key={employee.id}>{employee.firstname}</option>
                )
              })}
              {task.employee!==null && <option value="employee">Employee</option>}
            </select>
  
            <button type="submit">
              Submit
            </button>

          </form>
          { this.state.error !=="" && <p>{this.state.error}</p> }

          {task.employeeId !== null ?
            <div> Current employee:  
            <Link to={`/employee/${task.employeeId}`}>{task.employee.firstname}</Link>
            <button onClick={async () => {await editTask({id:task.id, employeeId: null});  fetchTask(task.id)}}>Unassign</button>
            </div>
            : <div> No employee currently assigned </div>
          }

          <div> Other employee
          {otherEmployees.map(employee => {
            return (
            <div key={employee.id}>
                <Link to={`/employee/${employee.id}`}>
                  <h4>{employee.firstname}</h4>
                </Link>
                <button onClick={async() => {await editTask({id:task.id, employeeId: employee.id}); fetchTask(task.id)}}>Assign this employee</button>
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
      task: state.task,
      allEmployees: state.allEmployees
    };
  };

const mapDispatch = (dispatch) => {
    return({
        editTask: (task) => dispatch(editTaskThunk(task)),
        fetchTask: (id) => dispatch(fetchTaskThunk(id)),
        fetchEmployees: () => dispatch(fetchAllEmployeesThunk()),

    })
}

export default connect(mapState, mapDispatch)(EditTaskContainer);