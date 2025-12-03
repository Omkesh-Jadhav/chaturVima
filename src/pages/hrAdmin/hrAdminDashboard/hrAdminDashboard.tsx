import AssessmentStatusCard from "./assessmentStatusCard"
import DepartmentDistribution from "./departmentDistribution"
import OrganisationHealthCards from "./organisationHealthCards"

const HrAdminDashboard = () => {
    return (
        <div>
            <AssessmentStatusCard/>
            <OrganisationHealthCards/>
            <DepartmentDistribution/>
        </div>
    )
}

export default HrAdminDashboard