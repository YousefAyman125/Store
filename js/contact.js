document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');

    // إنشاء عنصر لعرض الرسائل
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    form.parentNode.insertBefore(messageContainer, form.nextSibling);

    // دالة لعرض الرسائل
    function showMessage(message, type) {
        messageContainer.innerHTML = `
            <div class="alert alert-${type}">
                <div class="alert-content">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
                <button class="close-btn" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // إخفاء الرسالة تلقائياً بعد 5 ثواني
        setTimeout(() => {
            const alert = messageContainer.querySelector('.alert');
            if (alert) {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        }, 5000);
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');

        // تغيير نص الزر وتعطيله
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitButton.disabled = true;

        try {
            const formData = {
                fullname: form.fullname.value.trim(),
                phone: form.phone.value.trim(),
                email: form.email.value.trim(),
                subject: form.subject.value.trim(),
                message: form.message.value.trim()
            };

            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const result = await response.json();

            // عرض رسالة النجاح
            showMessage('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            // عرض رسالة الخطأ
            showMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            // إعادة الزر لحالته الأصلية
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
});