import { User } from "../models/User.model.js";

const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
            .populate("organizedCompetitions")
            .populate("registeredCompetitions")

        if(!user) {
            return res
            .status(404)
            .json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            organizedCompetitions: user.organizedCompetitions,
            registeredCompetitions: user.registeredCompetitions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching dashboard"
        });
    }

}

export {getUserDashboard}