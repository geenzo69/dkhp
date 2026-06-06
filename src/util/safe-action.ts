import { createSafeActionClient } from "next-safe-action";

const action = createSafeActionClient({
    handleServerError: (error) => {
        return error.message;
    }
});
export default action;