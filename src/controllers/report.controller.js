import { Report } from "../models/Report.model.js";
import { User } from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";

const submitReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        // Save the report first — this is the safety net. Even if the
        // email below fails to send (bad SMTP creds, Gmail rate limit,
        // network blip on the EC2 box, etc.), the report itself is never
        // lost; it's already sitting safely in the database.
        const report = await Report.create({
            user: userId,
            title: title.trim(),
            description: description.trim()
        });

        // Fetch the reporting user's name/email to include in the
        // notification, so you can reply to them directly if needed.
        const reportingUser = await User.findById(userId).select("name email");

        // Safe extraction of submission time to prevent template literal compilation issues
        const submissionTime = report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString();

        // Send the email notification. Wrapped in its own try/catch so
        // that an email failure never turns a successful report submission
        // into a 500 error for the user — the report is already saved
        // above regardless of whether this email goes through.
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                replyTo: reportingUser?.email, // Directly replies to the bug reporter
                subject: `[CODO Bug Report] ${title.trim()}`,
                html: `
                    <h2>New bug report submitted</h2>
                    <p><strong>From:</strong> ${reportingUser?.name || "Unknown user"} (${reportingUser?.email || "unknown email"})</p>
                    <p><strong>Title:</strong> ${title.trim()}</p>
                    <p><strong>Description:</strong></p>
                    <p style="white-space: pre-wrap;">${description.trim()}</p>
                    <p><strong>Submitted at:</strong> ${submissionTime}</p>
                    <p><strong>Report ID:</strong> ${report._id}</p>
                `
            });
        } catch (emailError) {
            // Log it, but don't fail the request — the user's report was
            // still saved successfully even if this notification didn't
            // go out. You can always check the Report collection directly
            // as a backup if email ever silently fails.
            console.error("Failed to send report notification email:", emailError.message || emailError);
        }

        return res.status(201).json({
            success: true,
            message: "Thank you! Your report has been submitted.",
            reportId: report._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting report"
        });
    }
}

export { submitReport }