export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
    AUTH: {
        LOG_IN: `/api/method/chaturvima_api.api.auth.login`,
        LOG_OUT: `/api/method/chaturvima_api.api.auth.logout`,
    },

    ASSESSMENT: {
        GET_ASSESSMENT_TYPES: `/api/resource/Questionnaire`,
    },

    EMPLOYEE: {

    },

    ORGANIZATION: {
        GET_ORGANIZATION_DETAILS: `/api/resource/Company`,
        
        GET_ALL_DEPARTMENTS: `/api/method/chaturvima_api.api.department.list_departments`,
        CREATE_DEPARTMENT: `/api/resource/Department`,
        UPDATE_DEPARTMENT: `/api/resource/Department`,
        DELETE_DEPARTMENT: `/api/resource/Department`,

        CREATE_EMPLOYEE: `api/resource/Employee`,
        GET_EMPLOYEES: `/api/resource/Employee`,
        GET_EMPLOYEE_DETAILS: `/api/resource/Employee`,
    },

    REPORT: {

    },

    USER: {

    }
}