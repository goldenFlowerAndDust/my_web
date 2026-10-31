/* 单词页交互：单词 → 词性 → 释义/例句 → 例句翻译
 * 不再默认隐藏整页，也不再注入“显示中文”按钮。
 */
(function () {
    'use strict';

    var POS_RE = /^(?:n|v|adj|adv|prep|pron|conj|num|art|int|aux|phr)\.(?:\s*\/\s*(?:n|v|adj|adv|prep|pron|conj|num|art|int|aux|phr)\.)*$/i;
    var LEVELS = { '小学': 1, '初中': 1, '高中': 1, '专升本': 1, '超纲': 1 };

    function parseNote(text) {
        var parts = String(text || '').split('·').map(function (x) { return x.trim(); }).filter(Boolean);
        var pos = '';
        var level = '';
        var kept = [];
        parts.forEach(function (part) {
            if (!pos && POS_RE.test(part)) {
                pos = part;
            } else if (!level && LEVELS[part]) {
                level = part;
            } else {
                kept.push(part);
            }
        });
        return { pos: pos, level: level, text: kept.join(' · ') };
    }

    function meaningNodes(text) {
        var meanings = String(text || '').split(/[；;]/).map(function (x) { return x.trim(); }).filter(Boolean);
        if (!meanings.length) meanings = [''];
        return meanings;
    }

    function buildHead(word, pos, level) {
        var head = document.createElement('div');
        head.className = 'ci_word_head';
        var code = document.createElement('code');
        code.className = 'en';
        code.textContent = word;
        head.appendChild(code);
        if (pos) {
            var posTag = document.createElement('span');
            posTag.className = 'pos_tag';
            posTag.textContent = pos;
            head.appendChild(posTag);
        }
        if (level) {
            var levelTag = document.createElement('span');
            levelTag.className = 'level_tag';
            levelTag.textContent = level;
            head.appendChild(levelTag);
        }
        return head;
    }

    function buildSenseList(meanings, example, pos) {
        var list = document.createElement('ul');
        list.className = 'sense_list pos_sense_list';
        var group = document.createElement('li');
        group.className = 'pos_group';

        if (pos) {
            var groupPos = document.createElement('span');
            groupPos.className = 'pos_tag';
            groupPos.textContent = pos;
            group.appendChild(groupPos);
        }

        var meaningList = document.createElement('ul');
        meaningList.className = 'pos_meanings';
        var item = document.createElement('li');
        item.className = 'sense_item';

        meanings.forEach(function (meaning, idx) {
            if (!meaning) return;
            var main = document.createElement('div');
            main.className = 'sense_main';
            var no = document.createElement('span');
            no.className = 'sense_no';
            no.textContent = String.fromCharCode(0x2460 + idx);
            var zh = document.createElement('span');
            zh.className = 'zh';
            zh.textContent = meaning;
            main.appendChild(no);
            main.appendChild(zh);
            item.appendChild(main);
        });

        if (example) {
            example.classList.add('sense_example');
            var exampleZh = example.querySelector('.zh');
            if (exampleZh) exampleZh.classList.add('sense_example_zh');
            item.appendChild(example);
        }

        meaningList.appendChild(item);
        group.appendChild(meaningList);
        list.appendChild(group);
        return list;
    }

    function enhanceExistingCard(li) {
        if (!li.querySelector('.ci_word_head')) return false;
        var isMain = li.classList.contains('word-card') || (li.id && li.id.indexOf('word-') === 0);
        if (!isMain) {
            li.classList.add('related-card');
            return true;
        }
        li.classList.add('word-card');

        var note = li.querySelector('.note');
        var info = parseNote(note ? note.textContent : '');
        if (note && info.text !== note.textContent) note.textContent = info.text;

        var head = li.querySelector('.ci_word_head');
        var headZh = head.querySelector('.zh');
        if (headZh) headZh.remove();
        if (info.level && !head.querySelector('.level_tag')) {
            var levelTag = document.createElement('span');
            levelTag.className = 'level_tag';
            levelTag.textContent = info.level;
            head.appendChild(levelTag);
        }

        // 兼容旧版生成页：把每个释义 li 变成 sense_item，并把全局例句放进第一个。
        li.querySelectorAll('.pos_meanings > li').forEach(function (item) {
            item.classList.add('sense_item');
        });

        // 旧版生成页把例句放在 sense_list 外面，移进第一个 sense_item。
        var outsideExample = li.querySelector(':scope > .example');
        var firstItem = li.querySelector('.sense_item');
        if (outsideExample && firstItem && !firstItem.querySelector('.sense_example')) {
            outsideExample.classList.add('sense_example');
            var exampleZh = outsideExample.querySelector('.zh');
            if (exampleZh) exampleZh.classList.add('sense_example_zh');
            firstItem.appendChild(outsideExample);
        }
        return true;
    }

    function enhanceLegacyCard(li) {
        if (li.querySelector('.word_line') || li.querySelector('.ci_word_head')) return;
        var container = li.querySelector(':scope > span');
        if (!container) return;
        var code = container.querySelector('code.en');
        var zh = container.querySelector('.zh');
        if (!code || !zh) return;

        var note = container.querySelector('.note');
        var info = parseNote(note ? note.textContent : '');
        var isMain = li.id && li.id.indexOf('word-') === 0;

        if (!isMain) {
            var relatedHead = buildHead(code.textContent.trim(), info.pos, info.level);
            var relatedZh = document.createElement('span');
            relatedZh.className = 'zh';
            relatedZh.textContent = zh.textContent.trim();
            relatedHead.appendChild(relatedZh);
            li.innerHTML = '';
            li.className = 'related-card';
            li.appendChild(relatedHead);
            if (info.text) {
                var relatedNote = document.createElement('p');
                relatedNote.className = 'note';
                relatedNote.textContent = info.text;
                li.appendChild(relatedNote);
            }
            return;
        }

        var example = li.querySelector('.example');
        if (example) li.removeChild(example);

        var meanings = meaningNodes(zh.textContent);
        var head = buildHead(code.textContent.trim(), info.pos, info.level);
        var list = buildSenseList(meanings, example, info.pos);

        li.innerHTML = '';
        li.classList.add('word-card');
        li.appendChild(head);
        li.appendChild(list);
        if (info.text) {
            var noteEl = document.createElement('p');
            noteEl.className = 'note';
            noteEl.textContent = info.text;
            li.appendChild(noteEl);
        }
    }

    function prepareCards() {
        document.body.classList.add('word-scroll-page');
        document.querySelectorAll('.word_div > li').forEach(function (li) {
            if (enhanceExistingCard(li)) return;
            enhanceLegacyCard(li);
        });
        ensureRevealButton();
        syncRevealButton();
    }

    function allDetailsRevealed() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.word-card'));
        if (!cards.length) return false;
        return cards.every(function (card) {
            if (!card.classList.contains('show-pos')) return false;
            var groups = Array.prototype.slice.call(card.querySelectorAll('.pos_group'));
            if (!groups.length || !groups.every(function (group) {
                return group.classList.contains('active');
            })) return false;
            var translations = Array.prototype.slice.call(card.querySelectorAll('.sense_item .sense_example_zh'));
            return translations.every(function (translation) {
                var item = translation.closest('.sense_item');
                return Boolean(item && item.classList.contains('show-translation'));
            });
        });
    }

    function clearAllExpansion(scope) {
        scope.querySelectorAll('.word-card').forEach(function (card) {
            card.classList.remove('show-pos', 'has-active-pos');
        });
        scope.querySelectorAll('.pos_group.active').forEach(function (group) {
            group.classList.remove('active');
        });
        scope.querySelectorAll('.sense_item.show-translation').forEach(function (item) {
            item.classList.remove('show-translation');
        });
    }

    function syncRevealButton() {
        var button = document.querySelector('.reveal-all-btn');
        if (!button) return;
        var scope = document.querySelector('main') || document.body;
        var hide = scope.classList.contains('reveal-all') || allDetailsRevealed();
        button.textContent = hide ? '隐藏全部中文' : '全部显示中文';
        button.setAttribute('data-mode', hide ? 'hide' : 'show');
    }

    function ensureRevealButton() {
        if (!document.querySelector('.word-card') || document.querySelector('.reveal-all-btn')) return;
        var main = document.querySelector('main');
        if (!main) return;
        var toolbar = document.createElement('div');
        toolbar.className = 'word_top_actions';
        var header = main.querySelector('header');
        if (header && header.parentNode === main) {
            main.insertBefore(toolbar, header.nextSibling);
        } else {
            main.insertBefore(toolbar, main.firstChild);
        }
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'reveal-all-btn';
        button.textContent = '全部显示中文';
        button.setAttribute('data-mode', 'show');
        button.addEventListener('click', function () {
            var scope = document.querySelector('main') || document.body;
            var hide = button.getAttribute('data-mode') === 'hide' ||
                scope.classList.contains('reveal-all') ||
                allDetailsRevealed();
            if (hide) {
                clearAllExpansion(scope);
                scope.classList.remove('reveal-all');
            } else {
                scope.classList.add('reveal-all');
            }
            syncRevealButton();
        });
        toolbar.appendChild(button);
        syncRevealButton();
    }

    document.addEventListener('click', function (event) {
        var li = event.target.closest('.word_div > li.word-card');
        if (!li) return;

        // 点例句：显示该例句的中文
        if (event.target.closest('.sense_example')) {
            var item = event.target.closest('.sense_item');
            if (item) item.classList.add('show-translation');
            syncRevealButton();
            return;
        }

        // 点词性：展开该词性下的全部释义和例句
        var groupTag = event.target.closest('.pos_group > .pos_tag');
        if (groupTag) {
            var group = groupTag.closest('.pos_group');
            if (group) {
                group.classList.toggle('active');
                li.classList.toggle('has-active-pos', Boolean(li.querySelector('.pos_group.active')));
            }
            syncRevealButton();
            return;
        }

        // 点单词：显示所有词性分类
        if (event.target.closest('.ci_word_head') || event.target.closest('.word_line')) {
            li.classList.add('show-pos');
            syncRevealButton();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', prepareCards);
    } else {
        prepareCards();
    }
})();
