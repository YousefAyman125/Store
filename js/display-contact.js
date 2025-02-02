document.addEventListener('DOMContentLoaded', function () {
    const contactsContainer = document.getElementById('contactsContainer');
    const refreshBtn = document.getElementById('refreshBtn');
    let isLoading = false;

    // دالة لتنسيق التاريخ
    function formatDate(dateString) {
        if (!dateString) return 'غير محدد';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'تاريخ غير صالح';

            return new Intl.DateTimeFormat('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'تاريخ غير صالح';
        }
    }

    // دالة لعرض الرسائل
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.innerHTML = `
            <div class="alert-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // دالة حذف الاتصال
    async function deleteContact(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/contacts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }

            // حذف العنصر من DOM مباشرة
            const contactElement = document.getElementById(`contact-${id}`);
            if (contactElement) {
                contactElement.style.opacity = '0';
                contactElement.style.transform = 'translateX(100px)';
                setTimeout(() => contactElement.remove(), 300);
            }

            showMessage('تم حذف الرسالة بنجاح', 'success');
        } catch (error) {
            console.error('Error deleting contact:', error);
            showMessage('فشل في حذف الرسالة', 'error');
        }
    }

    async function fetchContacts() {
        if (isLoading) return;

        isLoading = true;
        refreshBtn.disabled = true;

        contactsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                جاري التحميل...
            </div>
        `;

        try {
            const response = await fetch('http://localhost:5000/api/contacts');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contacts = await response.json();

            if (!contacts || contacts.length === 0) {
                contactsContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-inbox"></i>
                        لا توجد بيانات للعرض
                    </div>
                `;
                return;
            }

            const contactsHTML = contacts.map(contact => `
                <div class="contact-item" id="contact-${contact._id}">
                    <div class="contact-header">
                        <div class="contact-info">
                            <div class="contact-date">
                                <span>تاريخ الإرسال:</span> 
                                ${formatDate(contact.createdAt)}
                            </div>
                            <div class="contact-expiry">
                                <span>ينتهي في:</span> 
                                ${formatDate(contact.expiryDate)}
                            </div>
                        </div>
                        <button class="delete-btn" onclick="deleteContact('${contact._id}')">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-user"></i>
                        <span>${contact.fullname}</span>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-phone"></i>
                        <span>${contact.phone}</span>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${contact.email}</span>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-tag"></i>
                        <span>${contact.subject || 'لا يوجد موضوع'}</span>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-message"></i>
                        <span>${contact.message || 'لا توجد رسالة'}</span>
                    </div>
                </div>
            `).join('');

            contactsContainer.innerHTML = `
                <div class="contacts-grid">
                    ${contactsHTML}
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
            contactsContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    حدث خطأ في تحميل البيانات
                </div>
            `;
        } finally {
            isLoading = false;
            refreshBtn.disabled = false;
        }
    }

    // تعريف الدالة عالمياً
    window.deleteContact = deleteContact;

    // تحديث البيانات كل دقيقة
    fetchContacts();
    setInterval(fetchContacts, 60000);

    // تحديث عند الضغط على زر التحديث
    refreshBtn.addEventListener('click', fetchContacts);
});