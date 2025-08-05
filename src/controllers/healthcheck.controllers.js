import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    const response = new ApiResponse(200, "OK", "Server is running")
    res.status(response.statusCode).json(response)
})

export default healthcheck;