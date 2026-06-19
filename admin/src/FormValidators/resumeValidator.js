export default function resumeValidator(e) {
    let files = e.target.files;

    if (files.length === 0)
        return "";

    let file = files[0];

    if (file.size > 5 * 1024 * 1024)
        return "Resume Size is Too High. Please Upload a PDF Upto 5 MB";

    if (file.type !== "application/pdf")
        return "Invalid Resume Format. Please Upload a PDF File";

    return "";
}