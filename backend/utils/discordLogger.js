exports.sendDiscordNotification = async (webhookUrl, event) => {
    if (!webhookUrl) return;

    const message = {
        content: "**New Event Published!**",
        embeds: [{
            title: event.name,
            description: event.description,
            color: 5814783, // Felicity Blue
            fields: [
                { name: "Category", value: event.category, inline: true },
                { name: "Date", value: new Date(event.startDate).toDateString(), inline: true },
                { name: "Type", value: event.eventType, inline: true }
            ],
            footer: { text: "Check it out on the Felicity Portal!" }
        }]
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
    } catch (error) {
        console.error("Discord Webhook failed:", error.message);
    }
};