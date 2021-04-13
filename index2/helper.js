function BBCodeHelper () {

    var that                    = this;
    var quotes_regex            = /\[(font|url|color|background|hint|anchor|target|knowledge)\=&quot;(.*?)&quot;\]/gi;
    var hint_container_selector = '.bb-hint-container';
    var lastScroll              = 0;

    this.toggleHint = function (element) {
        $(element)
            .closest('div').parent()
            .find(hint_container_selector).toggle();
    };

    this.escapeHtml = function (text) {
        text = text || '';
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    };

    this.bbReplace = function (str) {
        str = str
            .replace(quotes_regex, function (match) {
                return match.replace(/&quot;/g, '"');
            })
            .replace(/\[(\/?)list\]/gi, '<$1ul>')
            .replace(/\[(\/?)table\]/gi, '<$1table>')
            .replace(/\[(\/?)tr\]/gi, '<$1tr>')
            .replace(/\[(\/?)td\]/gi, '<$1td>')
            .replace(/\[listnoli\]/gi, '<ul class="no-list-style">')
            .replace(/\[\/listnoli\]/gi, '</ul>')
            .replace(/\[(\/?)listnum\]/gi, '<$1ol>')
            .replace(/\[b\](.*?)\[\/b\]/gim, '<strong>$1</strong>')
            .replace(/\[p\](.*?)\[\/p\]/gim, '<p>$1</p>')
            .replace(/\[upper\](.*?)\[\/upper\]/gim, '<span style="text-transform: uppercase;">$1</span>')
            .replace(/\[capitalize\](.*?)\[\/capitalize\]/gim, '<span style="text-transform: capitalize;">$1</span>')
            .replace(/\[left\](.*?)\[\/left\]/gim, '<div style="text-align: left;">$1</div>')
            .replace(/\[center\](.*?)\[\/center\]/gim, '<div style="text-align: center;">$1</div>')
            .replace(/\[right\](.*?)\[\/right\]/gim, '<div style="text-align: right;">$1</div>')
            .replace(/\[justify\](.*?)\[\/justify\]/gim, '<div style="text-align: justify;">$1</div>')
            .replace(/\[u\](.*?)\[\/u\]/gim, '<span style="text-decoration: underline;">$1</span>')
            .replace(/\[i\](.*?)\[\/i\]/gim, '<em>$1</em>')
            .replace(/\[font\="(.*?)"\](.*?)\[\/font\]/gim, '<span style="font-size: $1rem;">$2</span>')
            .replace(/\[img\](.*?)\[\/img\]/gim, '<img class="bbImage" src="$1" alt="image">')
            .replace(/\[url="(.*?)"\](.*?)\[\/url\]/gi, '<a target="_blank" href="$1">$2</a>')
            .replace(/\[\*\]\s?(.*?)\n/gim, '<li>$1</li>')
            .replace(/\[color\="(.*?)"\](.*?)\[\/color\]/gim, '<span style="color: $1;">$2</span>')
            .replace(/\[background\="(.*?)"\](.*?)\[\/background\]/gim, '<span style="background: $1;">$2</span>')
            .replace(/\[hint\="(.*?)"\](.*?)\[\/hint\]/gim, '<span class="hintMoreInfo"><span style="cursor: pointer;" onclick="bootbox.alert(this.parentNode.getElementsByClassName(\'hintMoreInfoText\')[0].innerHTML);" class="hintMoreInfoLabel">$1</span><span class="hintMoreInfoText hidden"><br>$2</span></span>')
            .replace(/\[br\]/gim, '<br>')
            .replace(/\[anchor="(.*?)"\](.*?)\[\/anchor\]/gi, '<a id="$1">$2</a>')
            .replace(/\[bootbox_alert_func\]/i, '<style>.hintMoreInfoText.hidden { display: none; } .hintMoreInfoLabel { text-decoration: underline; }</style><script>if (typeof bootbox == \'undefined\') { bootbox = { alert : function(msg) { var newWindow = window.open("", null, "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no"); newWindow.document.body.innerHTML = msg; } } }</script>')
            .replace(/\[target="(.*?)"\]/gi, '<a href="#" style="margin: 3px;" class="btn btn-default btn-xs quick-start-hint" data-hint-href="$1"><i class="far fa-dot-circle"></i>Take me here</a>')
            .replace(/\[knowledge="(.*?)"\]/gi, '<a href="$1" class="btn btn-warning no-shadow btn-xs quick-start-hint" target="_blank" rel="noopener"><i class="far fa-book"></i>Knowledge base</a>')
        ;

        if (typeof bbRbrToP != "undefined" && bbRbrToP == true) {
            str = str
                .replace(/^(.+)$/gim, '<p>$1</p>')
                .replace(/^$/gim, '<br>')
            ;
        } else {
            str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
        }

        return str;
    };

    this.addTag = function (initiator, name, param) {

        var  target   = $(initiator).closest('div').data('target') || 'howToText'
            ,brackets = ['[', ']']
            ,tags     = []
            ,range    = []
            ,selected = '';

        tags.push(brackets.join(name+(param ? '='+param : '')));
        tags.push(brackets.join('/'+name));
        target  = document.getElementById(target);
        this.lastScroll = [target.scrollTop, target.scrollLeft];

        if ('selectionStart' in target) {
            range       = [target.selectionStart, target.selectionEnd];
            selected    = target.value.substr(range[0], range[1] - range[0]);
            target.value =
                target.value.substr(0, range[0])
               +tags.join(selected)
               +target.value.substr(range[1]);

            this.setXpos(target.id, range[1] + tags[0].length);

            if (typeof updateText === 'function') {
                updateText();
            }
        }
        /* Generate change event when add bb code tag */
        $(target).change();
        target.setSelectionRange(range[0] + tags[0].length, range[1] + tags[0].length);
        target.scrollTop = this.lastScroll[0];
        target.scrollLeft = this.lastScroll[1];
    };

    this.setXpos = function (zona, Xpos) {
        var txtarea = document.getElementById(zona);
        if (txtarea != null) {
            if (txtarea.createTextRange) {
                var range = txtarea.createTextRange();
                range.move('character', Xpos);
                range.select();
            }
            else {
                if (txtarea.selectionStart) {
                    txtarea.focus();
                    txtarea.setSelectionRange(Xpos, Xpos);
                }
                else {
                    txtarea.focus();
                }
            }
        }
    }
}

var BBCodeHelper = new BBCodeHelper();