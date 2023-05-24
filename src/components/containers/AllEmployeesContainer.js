import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployeesThunk, deleteEmployeeThunk } from "../../store/thunks";
import { AllEmployeesView } from "../views";

function AllEmployeesContainer() {
  const allEmployees = useSelector((state) => state.allEmployees);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllEmployeesThunk());
  }, [dispatch]);

  const handleDeleteEmployee = (employeeId) => {
    dispatch(deleteEmployeeThunk(employeeId));
  };

  return (
    <div>
      <AllEmployeesView allEmployees={allEmployees} deleteEmployee={handleDeleteEmployee}/>
    </div>
  );
}

export default AllEmployeesContainer;
