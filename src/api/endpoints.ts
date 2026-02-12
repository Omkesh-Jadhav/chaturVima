export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
    AUTH: {
        LOG_IN: `/api/method/chaturvima_api.api.auth.login`,
        LOG_OUT: `/api/method/chaturvima_api.api.auth.logout`,
    },

    ASSESSMENT: {
        GET_EMPLOYEE_ASSESSMENTS: `/api/method/chaturvima_api.api.assessment.assessment.get_employee_assessments`,
        ASSESSMENT_SUBMISSION: `/api/resource/Assessment Submission`, // Used for: GET by submission_name, GET with filters, PUT to submit
        SUBMIT_ASSESSMENT: `/api/resource/Assessment Submission`, // Alias for ASSESSMENT_SUBMISSION (kept for backward compatibility)
    },

    ASSESSMENT_CYCLE: {
        CREATE_CYCLE: `/api/resource/Assessment%20Cycle`,
        UPDATE_CYCLE: `/api/resource/Assessment%20Cycle`, // Used for both update and schedule (with docstatus: 1)
        GET_CYCLES: `/api/resource/Assessment%20Cycle`,
        GET_CYCLES_WITH_DEPARTMENTS: `/api/method/chaturvima_api.api.assessment.cycle.get_assessment_cycles_with_departments`,
    },

    EMPLOYEE: {

    },

    EMPLOYEE_DASHBOARD: {
        GET_EMPLOYEE_ASSESSMENT_SUMMARY: `/api/method/chaturvima_api.api.dashboard.get_employee_assessment_summary`,
    },

    ORGANIZATION: {
        GET_ORGANIZATION_DETAILS: `/api/resource/Company`,
        UPDATE_ORGANIZATION_DETAILS: `/api/resource/Company`,
        GET_ALL_INDUSTRIES: `/api/resource/Industry Type`,
        GET_ALL_DESIGNATIONS: `/api/resource/Designation`,
        CREATE_DESIGNATION: `/api/resource/Designation`,
        
        GET_ALL_DEPARTMENTS: `/api/method/chaturvima_api.api.department.list_departments`,
        CREATE_DEPARTMENT: `/api/resource/Department`,
        UPDATE_DEPARTMENT: `/api/resource/Department`,
        DELETE_DEPARTMENT: `/api/resource/Department`,

        CREATE_EMPLOYEE: `/api/method/chaturvima_api.api.user_employee.create_user_and_employee`,
        // GET_EMPLOYEES: `/api/resource/Employee`,
        GET_EMPLOYEES: `/api/method/chaturvima_api.api.user_employee.get_employee_list`,
        GET_EMPLOYEE_DETAILS: `/api/resource/Employee`,
        EDIT_EMPLOYEE_DETAILS: `/api/resource/Employee`,
        DELETE_EMPLOYEE: `/api/resource/Employee`,
        BULK_UPLOAD_EMPLOYEES: `/api/method/chaturvima_api.api.user_employee.bulk_upload_employees_excel`
    },

    REPORT: {

    },

    USER: {

    }
}