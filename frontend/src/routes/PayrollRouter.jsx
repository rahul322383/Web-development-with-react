import { useAuth } from "../context/AuthContext";
import AdminPayroll from "../pyaroll/AdminPayroll";
import EmployeePayroll from "../pyaroll/EmployeePayroll";

const ADMIN_ROLES = ["Admin", "HR", "Finance", "Manager"];

const PayrollRouter = () => {
    const { user } = useAuth();

    // support single role or multiple roles
    const userRoles = user?.roles ?? [user?.primaryRole].filter(Boolean);

    const isAdmin = userRoles.some(role =>
        ADMIN_ROLES.includes(role)
    );

    return isAdmin ? <AdminPayroll /> : <EmployeePayroll />;
};

export default PayrollRouter;