import { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';


import NewEmployeeView from '../views/NewEmployeeView';
import { addEmployeeThunk } from '../../store/thunks';

class NewEmployeeContainer extends Component {
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

    handleChange = event => {
      this.setState({
        [event.target.name]: event.target.value
      });
    }

    handleSubmit = async event => {
        event.preventDefault();
        //dont need ID because the course has not been created yet
        if(this.state.firstname===""){
          this.setState({error:"firstname field is required"});
          return;
        }
        if(this.state.lastname===""){
            this.setState({error:"lastname field is required"});
            return;
        }
        if(this.state.department===""){
          this.setState({error:"department field is required"});
          return;
      }
        let employee = {
            firstname: this.state.firstname, 
            lastname: this.state.lastname,
            department: this.state.department,
            tasks: this.state.tasks, 
            employeeId: this.state.employeeId
        };
        
        let newEmployee = await this.props.addEmployee(employee);

        this.setState({
          redirect: true, 
          redirectId: newEmployee.id,
          error: ""
        });
    }

    componentWillUnmount() {
        this.setState({redirect: false, redirectId: null});
    }

    render() {
      //go to single course view of newly created course
        if(this.state.redirect) {
          return (<Redirect to={`/employee/${this.state.redirectId}`}/>)
        }
        return (
          <NewEmployeeView 
            handleChange={this.handleChange} 
            handleSubmit={this.handleSubmit}
            error={this.state.error}      
          />
        );
    }
}

const mapDispatch = (dispatch) => {
    return({
        addEmployee: (employee) => dispatch(addEmployeeThunk(employee)),
    })
}

export default connect(null, mapDispatch)(NewEmployeeContainer);