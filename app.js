(function () {
  'use strict';

  var useState = React.useState;
  var useEffect = React.useEffect;
  var h = React.createElement;

  var DEV_EMAIL = 'baranidharan.data@gmail.com';

  var THEMES = [
    { id: 'purple', label: 'Purple' },
    { id: 'black', label: 'Black' },
    { id: 'blue', label: 'Blue' }
  ];

  var PROVIDERS = [
    { id: 'gmail', domain: 'gmail.com', label: 'Gmail', icon: '📧' },
    { id: 'outlook', domain: 'outlook.com', label: 'Outlook', icon: '📨' },
    { id: 'yahoo', domain: 'yahoo.com', label: 'Yahoo', icon: '🟣' },
    { id: 'icloud', domain: 'icloud.com', label: 'iCloud', icon: '☁️' },
    { id: 'proton', domain: 'proton.me', label: 'Proton', icon: '🔐' },
    { id: 'hotmail', domain: 'hotmail.com', label: 'Hotmail', icon: '🔥' },
    { id: 'zoho', domain: 'zoho.com', label: 'Zoho', icon: '🧩' },
    { id: 'any', domain: null, label: 'Mix of all', icon: '🎲' }
  ];

  var MIX_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'icloud.com'];

  var CATEGORIES = [
    { id: 'pro', label: 'Professional', icon: '💼', words: ['pro', 'work', 'careers', 'hire', 'official', 'desk'] },
    { id: 'student', label: 'Student', icon: '🎓', words: ['study', 'campus', 'scholar', 'learn', 'notes', 'class'] },
    { id: 'gamer', label: 'Gaming', icon: '🎮', words: ['gg', 'pixel', 'clutch', 'ninja', 'quest', 'respawn'] },
    { id: 'creator', label: 'Creator', icon: '🎬', words: ['studio', 'creates', 'daily', 'vlogs', 'reels', 'frames'] },
    { id: 'business', label: 'Business', icon: '🏢', words: ['biz', 'hq', 'sales', 'team', 'trade', 'ventures'] },
    { id: 'dev', label: 'Developer', icon: '💻', words: ['dev', 'code', 'byte', 'stack', 'git', 'build'] },
    { id: 'social', label: 'Social', icon: '💬', words: ['vibes', 'social', 'chat', 'hey', 'squad', 'real'] },
    { id: 'shop', label: 'Shopping', icon: '🛍️', words: ['deals', 'shop', 'cart', 'orders', 'store', 'buy'] },
    { id: 'private', label: 'Private', icon: '🔒', words: ['private', 'secure', 'safe', 'quiet', 'vault', 'mail'] }
  ];

  var FALLBACK_FIRST = ['arun', 'divya', 'kavin', 'meera', 'rohan', 'sara', 'liam', 'noah', 'zoya', 'aditya', 'nila', 'ethan', 'ava', 'karthik', 'priya', 'mia', 'isha'];
  var FALLBACK_LAST = ['kumar', 'raj', 'smith', 'khan', 'lee', 'patel', 'nair', 'stone', 'vega', 'shah', 'brown', 'mehta', 'cruz'];
  var FALLBACK_WORDS = ['spark', 'nova', 'pixel', 'river', 'cloud', 'maple', 'orbit', 'swift', 'amber', 'lunar', 'echo', 'zen'];

  function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function num() { return String(Math.floor(Math.random() * 90) + 10); }
  function clean(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  }

  // Random names + words from public APIs (fetch). Falls back to local lists if offline or blocked.
  function fetchMix() {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
    var opts = ctrl ? { signal: ctrl.signal } : {};

    var peopleReq = fetch('https://randomuser.me/api/?results=12&inc=name&nat=in,us,gb,au,ca', opts)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        return (d.results || []).map(function (p) {
          return { first: clean(p.name && p.name.first), last: clean(p.name && p.name.last) };
        });
      });

    var wordsReq = fetch('https://random-word-api.herokuapp.com/word?number=12&length=5', opts)
      .then(function (r) { return r.json(); })
      .then(function (d) { return Array.isArray(d) ? d.map(clean) : []; });

    return Promise.allSettled([peopleReq, wordsReq]).then(function (res) {
      clearTimeout(timer);
      var people = res[0].status === 'fulfilled' ? res[0].value.filter(function (p) { return p.first && p.last; }) : [];
      var words = res[1].status === 'fulfilled' ? res[1].value.filter(Boolean) : [];
      if (!people.length) {
        people = FALLBACK_FIRST.map(function (f) { return { first: f, last: rnd(FALLBACK_LAST) }; });
      }
      if (!words.length) words = FALLBACK_WORDS;
      return { people: people, words: words, live: res[0].status === 'fulfilled' };
    });
  }

  function generate(provider, name, cat, mix) {
    var parts = name.trim().split(/\s+/).map(clean).filter(Boolean);
    var first = parts[0] || 'user';
    var last = parts[1] || '';
    var cw = cat.words;
    var ew = mix.words.length ? mix.words : cw;
    var people = mix.people;

    var patterns = [
      function () { return last ? first + '.' + last : first + '.' + rnd(cw); },
      function () { return first + '.' + rnd(cw); },
      function () { return rnd(cw) + '.' + first; },
      function () { return first + (last ? last[0] : '') + num(); },
      function () { return first + '.' + rnd(ew); },
      function () { return rnd(ew) + '.' + first; },
      function () { return first + '.' + rnd(cw) + num(); },
      function () { return first + '.' + clean(rnd(people).last); },
      function () { return first + clean(rnd(people).first).slice(0, 3) + num(); },
      function () { return first + '.' + rnd(ew) + '.' + rnd(cw); },
      function () { return 'the.' + first + '.' + rnd(cw); },
      function () { return first + num() + '.' + rnd(cw); },
      function () { return first.charAt(0) + (last || rnd(cw)) + '.' + rnd(ew); }
    ];

    var seen = {};
    var out = [];
    var tries = 0;
    while (out.length < 12 && tries < 300) {
      tries++;
      var local = rnd(patterns)().replace(/\.{2,}/g, '.').replace(/^\.|\.$/g, '');
      if (local.length < 6 || local.length > 30 || seen[local]) continue;
      seen[local] = true;
      out.push({ local: local, domain: provider.domain || rnd(MIX_DOMAINS), icon: cat.icon });
    }
    return out;
  }

  function fallbackCopy(t) {
    try {
      var a = document.createElement('textarea');
      a.value = t;
      a.style.position = 'fixed';
      a.style.opacity = '0';
      document.body.appendChild(a);
      a.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(a);
      return ok;
    } catch (e) { return false; }
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return fallbackCopy(t); });
    }
    return Promise.resolve(fallbackCopy(t));
  }

  function Header(props) {
    return h('header', { className: 'top' },
      h('div', { className: 'logo' }, h('span', { className: 'logo-mark' }, '✉️'), 'MailMint'),
      h('div', { className: 'themes', role: 'group', 'aria-label': 'Theme' },
        THEMES.map(function (t) {
          return h('button', {
            key: t.id,
            className: 'dot dot-' + t.id + (props.theme === t.id ? ' on' : ''),
            'aria-label': t.label + ' theme',
            'aria-pressed': props.theme === t.id,
            onClick: function () { props.setTheme(t.id); }
          });
        })
      )
    );
  }

  function Bars(props) {
    return h('div', { className: 'bars', 'aria-hidden': 'true' },
      [0, 1, 2, 3].map(function (i) {
        return h('div', { key: i, className: 'bar' + (i <= props.step ? ' done' : '') }, h('i'));
      })
    );
  }

  function DevCard() {
    return h('div', { className: 'dev-wrap' },
      h('div', { className: 'dev' },
        h('div', { className: 'dev-ava' }, 'B', h('b', { 'aria-hidden': 'true' }, '👑')),
        h('div', { className: 'dev-info' },
          h('span', { className: 'vip' }, '👑 VIP DEV'),
          h('div', { className: 'dev-name' }, 'Baranidharan'),
          h('a', { className: 'dev-mail', href: 'mailto:' + DEV_EMAIL }, DEV_EMAIL)
        ),
        h('a', { className: 'btn primary', href: 'mailto:' + DEV_EMAIL, style: { textDecoration: 'none', textAlign: 'center', flex: 'none', minWidth: 0 } }, 'Contact dev')
      )
    );
  }

  function App() {
    var themeState = useState(function () {
      try {
        var s = localStorage.getItem('mm-theme');
        if (s === 'purple' || s === 'black' || s === 'blue') return s;
      } catch (e) { /* storage blocked */ }
      return 'purple';
    });
    var theme = themeState[0], setTheme = themeState[1];
    var stepState = useState(0), step = stepState[0], setStep = stepState[1];
    var provState = useState(null), provider = provState[0], setProvider = provState[1];
    var nameState = useState(''), name = nameState[0], setName = nameState[1];
    var whyState = useState(''), why = whyState[0], setWhy = whyState[1];
    var catState = useState(null), cat = catState[0], setCat = catState[1];
    var resState = useState([]), results = resState[0], setResults = resState[1];
    var loadState = useState(false), loading = loadState[0], setLoading = loadState[1];
    var toastState = useState(''), toast = toastState[0], setToast = toastState[1];

    useEffect(function () {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('mm-theme', theme); } catch (e) { /* ignore */ }
    }, [theme]);

    useEffect(function () {
      if (!toast) return undefined;
      var t = setTimeout(function () { setToast(''); }, 1600);
      return function () { clearTimeout(t); };
    }, [toast]);

    function run(c) {
      setCat(c);
      setStep(3);
      setLoading(true);
      fetchMix().then(function (mix) {
        setResults(generate(provider, name, c, mix));
        setLoading(false);
      });
    }

    function copy(text) {
      copyText(text).then(function (ok) { setToast(ok ? 'Copied ' + text : 'Copy failed'); });
    }

    function reset() {
      setStep(0); setProvider(null); setName(''); setWhy(''); setCat(null); setResults([]);
    }

    var panel;

    if (step === 0) {
      panel = h('section', { className: 'panel', key: 'p0' },
        h('h1', null, 'Which inbox do you want?'),
        h('p', { className: 'sub' }, 'Pick a provider. We will mix fresh ideas for it.'),
        h('div', { className: 'grid g4' },
          PROVIDERS.map(function (p) {
            return h('button', { key: p.id, className: 'tile', onClick: function () { setProvider(p); setStep(1); } },
              h('span', { className: 'tile-ico' }, p.icon),
              h('span', { className: 'tile-name' }, p.label),
              h('span', { className: 'tile-sub' }, p.domain ? '@' + p.domain : 'all types')
            );
          })
        )
      );
    } else if (step === 1) {
      var okName = name.trim().length >= 2;
      panel = h('section', { className: 'panel', key: 'p1' },
        h('h1', null, 'Tell us about you'),
        h('p', { className: 'sub' }, 'Your name shapes the ideas. The reason helps you pick later.'),
        h('form', { onSubmit: function (e) { e.preventDefault(); if (okName) setStep(2); } },
          h('label', { htmlFor: 'nm' }, 'Your name'),
          h('input', { id: 'nm', value: name, maxLength: 40, autoFocus: true, autoComplete: 'off', placeholder: 'e.g. Arun Kumar', onChange: function (e) { setName(e.target.value); } }),
          h('label', { htmlFor: 'why' }, 'Why do you need this email?'),
          h('input', { id: 'why', value: why, maxLength: 60, autoComplete: 'off', placeholder: 'e.g. job applications', onChange: function (e) { setWhy(e.target.value); } }),
          h('div', { className: 'row' },
            h('button', { type: 'button', className: 'btn', onClick: function () { setStep(0); } }, 'Back'),
            h('button', { type: 'submit', className: 'btn primary', disabled: !okName }, 'Continue')
          )
        )
      );
    } else if (step === 2) {
      panel = h('section', { className: 'panel', key: 'p2' },
        h('h1', null, 'Pick your vibe'),
        h('p', { className: 'sub' }, 'Choose a category for ' + (name.trim() || 'you') + '. Ideas are generated on tap.'),
        h('div', { className: 'grid g3' },
          CATEGORIES.map(function (c) {
            return h('button', { key: c.id, className: 'tile', onClick: function () { run(c); } },
              h('span', { className: 'tile-ico' }, c.icon),
              h('span', { className: 'tile-name' }, c.label)
            );
          })
        ),
        h('div', { className: 'row' }, h('button', { className: 'btn', onClick: function () { setStep(1); } }, 'Back'))
      );
    } else {
      panel = h('section', { className: 'panel', key: 'p3' },
        h('h1', null, loading ? 'Mixing names...' : 'Your fresh emails'),
        h('div', { className: 'chips' },
          provider ? h('span', { className: 'chip' }, provider.icon + ' ' + provider.label) : null,
          cat ? h('span', { className: 'chip' }, cat.icon + ' ' + cat.label) : null,
          why.trim() ? h('span', { className: 'chip' }, 'For: ' + why.trim()) : null
        ),
        loading
          ? h('div', { className: 'list' }, [0, 1, 2, 3, 4, 5].map(function (i) { return h('div', { key: i, className: 'skel' }); }))
          : h('div', { className: 'list' },
              results.map(function (r, i) {
                var full = r.local + '@' + r.domain;
                return h('div', { key: full, className: 'mail', style: { animationDelay: i * 45 + 'ms' } },
                  h('div', { className: 'mail-ico', 'aria-hidden': 'true' }, r.icon),
                  h('div', { className: 'mail-body' },
                    h('div', { className: 'mail-user' }, r.local),
                    h('div', { className: 'mail-dom' }, '@' + r.domain)
                  ),
                  h('button', { className: 'copy', 'aria-label': 'Copy ' + full, onClick: function () { copy(full); } }, 'Copy')
                );
              })
            ),
        h('div', { className: 'row' },
          h('button', { className: 'btn', onClick: function () { setStep(2); } }, 'Change vibe'),
          h('button', { className: 'btn primary', disabled: loading, onClick: function () { run(cat); } }, '🔄 Generate more')
        ),
        h('p', { className: 'note' }, 'These are ideas only. Check availability on the provider sign-up page.')
      );
    }

    return h(React.Fragment, null,
      h(Header, { theme: theme, setTheme: setTheme }),
      h('main', null, h(Bars, { step: step }), panel),
      h(DevCard),
      toast ? h('div', { className: 'toast', role: 'status' }, toast) : null
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
