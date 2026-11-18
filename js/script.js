(() => {
    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];

    const hasMotion = typeof Motion !== 'undefined';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useMotion = hasMotion && !reduce;

    /* Motionが使えない / 動きを減らす設定のときは、全部そのまま表示 */
    if (!useMotion) {
        document.documentElement.classList.remove('js');
        const loader = $('#loader');
        if (loader) loader.remove();
    }

    const { animate, inView, scroll, stagger } = hasMotion ? Motion : {};
    const ease = [0.22, 1, 0.36, 1];

    /* ---------- テキストを行ごとのマスクに変換（<br>区切り） ---------- */
    if (useMotion) {
        $$('[data-lines]').forEach(el => {
            const lines = el.innerHTML.split(/<br\s*\/?>/i);
            el.innerHTML = lines
                .map(l => `<span class="line-mask"><span class="line-inner">${l}</span></span>`)
                .join('');
        });
    }

    /* ---------- ヘッダー ---------- */
    const header = $('#header');
    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 60);
        header.classList.toggle('hide', y > lastY && y > 300 && !$('#nav').classList.contains('open'));
        lastY = y;
    }, { passive: true });

    /* ---------- モバイルメニュー ---------- */
    const menuBtn = $('#menu-btn');
    const nav = $('#nav');
    const closeMenu = () => {
        nav.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('locked');
    };
    menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('locked', open);
    });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', closeMenu));

    /* ---------- オープニング → ヒーロー ---------- */
    function playHero() {
        if (!useMotion) return;
        animate('.hero-logo .char', { y: ['110%', '0%'] }, { duration: 1.4, delay: stagger(0.12), ease });
        animate('.hero-visual', { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1.6, delay: 0.2, ease });
        animate('[data-hero="fade"]', { opacity: [0, 1], y: [20, 0] }, { duration: 1.2, delay: stagger(0.15, { startDelay: 0.7 }), ease });
    }

    if (useMotion) {
        const loader = $('#loader');
        document.body.classList.add('locked');
        const logo = $('.loader-logo');
        animate(logo, { opacity: [0, 1], letterSpacing: ['0.6em', '0.2em'] }, { duration: 1.4, ease }).then(() =>
            animate(loader, { y: ['0%', '-100%'] }, { duration: 1, delay: 0.3, ease })
        ).then(() => {
            loader.remove();
            document.body.classList.remove('locked');
        });
        // ローダーが上がり始めるタイミングでヒーローを開始
        setTimeout(playHero, 2500);
    }

    /* ---------- スクロールで表示 ---------- */
    if (useMotion) {
        inView('.reveal', (el) => {
            animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 1.2, ease });
        }, { margin: '0px 0px -12% 0px' });

        $$('[data-lines]').forEach(el => {
            inView(el, () => {
                animate($$('.line-inner', el), { y: ['110%', '0%'] }, { duration: 1.2, delay: stagger(0.15), ease });
            }, { margin: '0px 0px -10% 0px' });
        });

        /* ---------- 画像のゆっくりパララックス ---------- */
        $$('[data-parallax]').forEach(el => {
            const amount = parseFloat(el.dataset.parallax) * 100; // %
            scroll(animate(el, { y: [`-${amount / 2}%`, `${amount / 2}%`] }, { ease: 'linear' }), {
                target: el.parentElement,
                offset: ['start end', 'end start']
            });
        });
    }

    /* ---------- モーダル ---------- */
    const orderModal = $('#order-modal');
    const contactModal = $('#contact-modal');
    const openModal = (m) => { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); };
    const closeModal = (m) => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('locked'); };

    document.addEventListener('click', (e) => {
        const orderBtn = e.target.closest('.btn-order');
        if (orderBtn) {
            $('#order-product').value = orderBtn.dataset.name;
            $('#order-price').value = orderBtn.dataset.price;
            $('#order-quantity').value = 1;
            openModal(orderModal);
            return;
        }
        if (e.target.closest('.btn-contact')) { openModal(contactModal); return; }
        if (e.target.closest('.close-modal')) { closeModal(e.target.closest('.modal')); return; }
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') [orderModal, contactModal].forEach(closeModal);
    });

    /* ---------- メール起動 ---------- */
    // 🔧 実際のメールアドレスに変更してください
    const MAIL = 'runo.handmade@gmail.com';
    const sendMail = (subject, body) => {
        window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    $('#order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = (id) => $(id).value;
        sendMail(`【ご注文】${v('#order-product')}`, [
            '以下の内容で注文します。', '',
            '■ご注文商品', `商品名：${v('#order-product')}`, `価格：${v('#order-price')}`, `数量：${v('#order-quantity')}`, '',
            '■お客様情報', `お名前：${v('#order-name')}`, `ご住所：${v('#order-address')}`, `電話番号：${v('#order-phone')}`, '',
            '--------------------------------', '※このメールを送信して完了してください。'
        ].join('\n'));
        closeModal(orderModal);
    });

    $('#contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#contact-name').value;
        sendMail(`【お問い合わせ】${name}様より`, [
            '■お名前', name, '', '■お問い合わせ内容', $('#contact-message').value, '',
            '--------------------------------', '※このメールを送信して完了してください。'
        ].join('\n'));
        closeModal(contactModal);
    });
})();
