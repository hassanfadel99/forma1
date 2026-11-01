document.addEventListener('DOMContentLoaded', () => {

    // 1. تفعيل كافة القوائم المنسدلة
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const selectedText = dropdown.querySelector('.selected-text');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const items = dropdown.querySelectorAll('.dropdown-list li');
        const parentBox = dropdown.closest('.field-box');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    d.closest('.field-box')?.classList.remove('dropdown-open');
                }
            });

            dropdown.classList.toggle('active');
            parentBox?.classList.toggle('dropdown-open');

            // التركيز التلقائي على حقل البحث إذا كان متوفراً (مثل قائمة الفرق)
            if (dropdown.classList.contains('active') && dropdown.id === 'teamDropdown') {
                const searchInput = dropdown.querySelector('#teamSearch');
                if (searchInput) setTimeout(() => searchInput.focus(), 100);
            }
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = item.getAttribute('data-value');
                hiddenInput.value = value;
                selectedText.textContent = value;
                selectedText.classList.remove('placeholder');

                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                dropdown.classList.remove('active');
                parentBox?.classList.remove('dropdown-open', 'invalid');
            });
        });
    });

    // 2. ميزة البحث الفوري لاسم الفرقة
    const teamSearch = document.getElementById('teamSearch');
    const teamItems = document.querySelectorAll('#teamList li');

    if (teamSearch) {
        teamSearch.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            teamItems.forEach(item => {
                const text = item.getAttribute('data-value');
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });

        teamSearch.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('click', () => {
        dropdowns.forEach(d => {
            d.classList.remove('active');
            d.closest('.field-box')?.classList.remove('dropdown-open');
        });
    });

    // 3. التحديد التلقائي لليوم عند اختيار التاريخ
    const dateInput = document.getElementById('date');
    const dayDropdown = document.getElementById('dayDropdown');
    const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    if (dateInput && dayDropdown) {
        dateInput.addEventListener('change', function() {
            if (this.value) {
                const selectedDate = new Date(this.value);
                const dayName = daysArabic[selectedDate.getDay()];
                const targetItem = dayDropdown.querySelector(`li[data-value="${dayName}"]`);
                if (targetItem) targetItem.click();
            }
        });
    }

    // إزالة علامة الخطأ عند بدء الكتابة
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.closest('.field-box')?.classList.remove('invalid');
        });
    });

    // 4. التحكم في الإرسال
    const form = document.getElementById('activityForm');
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('statusModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    let isSubmitted = false;

    form.addEventListener('submit', function(e) {
        let isValid = true;

        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.closest('.field-box')?.classList.add('invalid');
            }
        });

        if (!isValid) {
            e.preventDefault();
            const firstInvalid = form.querySelector('.field-box.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        isSubmitted = true;
        const btnText = submitBtn.querySelector('.btn-text');
        
        setTimeout(() => {
            if (btnText) btnText.textContent = 'جاري الإرسال...';
            submitBtn.disabled = true;
        }, 10);
    });

    // الاستماع لانتهاء استلام البيانات من Google Script
    const hiddenIframe = document.getElementById('hidden_iframe');
    if (hiddenIframe) {
        hiddenIframe.addEventListener('load', function() {
            if (isSubmitted) {
                showModal('تم إرسال الاستمارة بنجاح');
                resetCustomForm();
                
                const btnText = submitBtn.querySelector('.btn-text');
                if (btnText) btnText.textContent = 'إرسال الاستمارة';
                submitBtn.disabled = false;
                
                isSubmitted = false;
            }
        });
    }

    function resetCustomForm() {
        form.reset();
        if (teamSearch) {
            teamSearch.value = '';
            teamItems.forEach(item => item.style.display = 'flex');
        }
        dropdowns.forEach(d => {
            d.querySelector('input[type="hidden"]').value = '';
            const txt = d.querySelector('.selected-text');
            
            // إعادة النصوص الافتراضية
            if(d.id === 'teamDropdown') txt.textContent = 'اختر اسم الفرقة من القائمة...';
            else txt.textContent = 'اختيار...';
            
            txt.classList.add('placeholder');
            d.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
        });
    }

    function showModal(title) {
        const titleEl = document.getElementById('modalTitle');
        if (titleEl) titleEl.textContent = title;
        modal.classList.add('show');
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
});