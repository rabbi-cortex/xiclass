(function() {
    'use strict';

    const roll = document.getElementById('roll');
    const reg = document.getElementById('reg');
    const board = document.getElementById('board');
    const year = document.getElementById('year');
    const mobile1 = document.getElementById('mobile1');
    const mobile2 = document.getElementById('mobile2');
    const agree = document.getElementById('agree');
    const submitBtn = document.getElementById('submitBtn');
    const err1 = document.getElementById('err1');
    const err2 = document.getElementById('err2');
    const warningBox = document.getElementById('warningBox');
    const statusMsg = document.getElementById('statusMsg');
    const form = document.getElementById('regForm');

    function attachTextBehavior(input, placeholder) {
        if (!input) return;
        input.addEventListener('focus', function() {
            if (this.value === '') this.placeholder = placeholder;
        });
        input.addEventListener('blur', function() {
            if (this.value === '') this.placeholder = '';
        });
    }
    attachTextBehavior(roll, 'এখানে রোল নম্বর দিন');
    attachTextBehavior(reg, 'এখানে রেজিস্ট্রেশন নম্বর দিন');

    function attachMobileBehavior(input) {
        if (!input) return;
        input.addEventListener('focus', function() {
            if (this.value === '') this.placeholder = '01xxxxxxxxx';
        });
        input.addEventListener('blur', function() {
            if (this.value === '') this.placeholder = '';
        });
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 11) this.value = this.value.slice(0, 11);
            if (this.value && !this.value.startsWith('01')) {
                this.value = '01' + this.value.slice(0, 9);
            }
        });
    }
    attachMobileBehavior(mobile1);
    attachMobileBehavior(mobile2);

    agree.addEventListener('change', function() {
        submitBtn.disabled = !this.checked;
        if (this.checked) {
            warningBox.classList.add('green');
        } else {
            warningBox.classList.remove('green');
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        let valid = true;
        const m1 = mobile1.value.trim();
        const m2 = mobile2.value.trim();

        if (m1.length !== 11 || !m1.startsWith('01')) {
            err1.style.display = 'block';
            valid = false;
        } else {
            err1.style.display = 'none';
        }

        if (m2 !== m1 || m2.length !== 11) {
            err2.style.display = 'block';
            valid = false;
        } else {
            err2.style.display = 'none';
        }

        if (!agree.checked) {
            alert('অনুগ্রহ করে শর্তাবলী পড়ে সম্মতি দিন');
            return;
        }
        if (!valid) return;

        const payload = {
            roll: roll.value.trim(),
            reg: reg.value.trim(),
            board: board.value,
            year: year.value,
            mobile1: m1,
            mobile2: m2
        };

        // 🔥 লোডিং মেসেজ – GitHub এর কোনো উল্লেখ নেই
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ দয়া করে অপেক্ষা করুন...';
        statusMsg.className = 'status-msg show loading';
        statusMsg.textContent = '⏳ আপনার তথ্য যাচাই করা হচ্ছে...';

        try {
            const API_URL = '/api/register';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error('সার্ভার থেকে সঠিক রেসপন্স আসছে না');
            }

            if (response.ok && result.success) {
                // ✅ সাফল্যের মেসেজ – সম্পূর্ণ জেনেরিক
                statusMsg.className = 'status-msg show success';
                statusMsg.textContent = '✅ সাইন আপ সম্পূর্ণ। ইউজার আইডি ও PIN এর জন্য অপেক্ষা করুন।';
                form.reset();
                submitBtn.disabled = true;
                agree.checked = false;
                warningBox.classList.remove('green');
            } else {
                throw new Error(result.error || 'সংরক্ষণ ব্যর্থ');
            }
        } catch (error) {
            // ❌ এরর মেসেজ – জেনেরিক
            statusMsg.className = 'status-msg show error';
            statusMsg.textContent = '❌ দুঃখিত, আবার চেষ্টা করুন।';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'সাইন আপ';
        }
    });

})();
