// ============================================================
//  script.js — ফর্ম হ্যান্ডলিং + GitHub API কল
// ============================================================

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

    // ─── প্লেসহোল্ডার ───
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

    // ─── মোবাইল ফরম্যাট ───
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

    // ─── চেকবক্স ───
    agree.addEventListener('change', function() {
        submitBtn.disabled = !this.checked;
        if (this.checked) {
            warningBox.classList.add('green');
        } else {
            warningBox.classList.remove('green');
        }
    });

    // ─── সাবমিট ───
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // ভ্যালিডেশন
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

        // ─── ডাটা ───
        const payload = {
            roll: roll.value.trim(),
            reg: reg.value.trim(),
            board: board.value,
            year: year.value,
            mobile1: m1,
            mobile2: m2
        };

        // ─── UI লোডিং ───
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ সংরক্ষণ হচ্ছে...';
        statusMsg.className = 'status-msg show loading';
        statusMsg.textContent = '⏳ ডাটা GitHub-এ সংরক্ষণ করা হচ্ছে...';

        try {
            // 🔥 এখানে তোমার Vercel API URL বসাও
            const API_URL = '/api/register'; 
            // উদাহরণ: 'https://your-app.vercel.app/api/register'

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                statusMsg.className = 'status-msg show success';
                statusMsg.textContent = '✅ ' + result.message + ' — GitHub রেপো চেক করুন!';
                form.reset();
                submitBtn.disabled = true;
                agree.checked = false;
                warningBox.classList.remove('green');
            } else {
                throw new Error(result.error || 'সংরক্ষণ ব্যর্থ');
            }
        } catch (error) {
            statusMsg.className = 'status-msg show error';
            statusMsg.textContent = '❌ ' + error.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'সাইন আপ';
        }
    });

})();