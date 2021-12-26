// enable to show all hooks in debug mode
// CONFIG.debug.hooks = true

Hooks.on('renderSidebarTab', (app, html, data) => {
  
    let $chat_form = html.find('#chat-log');
    const template = 'modules/dsa5-custom-chat/templates/tray.html';
    const options = {
        actors: game.data.actors.filter(actor => actor.type == "character")
    };
  
    renderTemplate(template, options).then(c => {
        if (c.length > 0) {
            let $content = $(c);
            $chat_form.after($content);

            // mousdown clear filter button
            html.find('a.actor-filter-button-clear').mousedown(ev => {
                // left-click
                if (ev.button == 0) {
                    $(`li.chat-message`).show();
                    $(`a.actor-filter-button`).toggleClass("actor-filter-active", false);
                }
                // right-click
                else if (ev.button == 2) {
                    $(`li.chat-message[data-actor-id]`).hide();
                    $(`a.actor-filter-button`).toggleClass("actor-filter-active", true);
                }
            });

            // mousdown actor button
            html.find('a.actor-filter-button').mousedown(ev => {

                let actorId = $(ev.currentTarget).attr("data-actor-id")

                // left-click
                if (ev.button == 0) {
                    $(`li.chat-message[data-actor-id="${actorId}"]`).show();
                    $(`a.actor-filter-button[data-actor-id="${actorId}"]`).toggleClass("actor-filter-active", false);

                    // single actor selection
                    if (!ev.ctrlKey) {                        
                        $(`li.chat-message[data-actor-id]:not([data-actor-id="${actorId}"])`).hide();
                        $(`a.actor-filter-button:not([data-actor-id="${actorId}"])`).toggleClass("actor-filter-active", true);
                    }
                }
                // right-click
                else if (ev.button == 2) {
                    $(`li.chat-message[data-actor-id="${actorId}"]`).hide();
                    $(`a.actor-filter-button[data-actor-id="${actorId}"]`).toggleClass("actor-filter-active", true);
                }
            });
        }
    });
});


Hooks.on("renderChatMessage", function(message, html, data) {
    
    // only render checks (not reactions)
    if (!data.message.flags.data) {
        return;
    }

    data.custom = generateCustomMessageData(data.message.flags.data);

    const template = 'modules/dsa5-custom-chat/templates/chatMessage.html';
    renderTemplate(template, data).then(c => {
        if (c.length > 0) {
            let $content = $(c);

            // check applied actor filters
            $('a.actor-filter-button.actor-filter-active').each(function(i, val) {
                let actorId = $(val).attr("data-actor-id")

                // hide message if actor filter is applied
                if (actorId == data.message.speaker.actor) {
                    $content.css('display', 'none');
                }
            });

            // add custom attributes and replace inner html
            html.attr('data-actor-id', data.message.speaker.actor);
            html.attr('success-level', data.message.flags.data.postData.successLevel);
            html.html($content);

        }
    });
});

function generateCustomMessageData(data) {

    let sourceType = data.preData.source.type;
    let sourceTypeIcon = "";
    let summary ="";

    if (sourceType == "skill") {
        sourceTypeIcon = "fa-graduation-cap";
        summary =
            data.preData.source.name +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            "<b>FP: </b>" + data.postData.result +
            (data.postData.qualityStep ? ", <b>QS: </b>" + data.postData.qualityStep : "");
    }
    else if (sourceType == "meleeweapon") {

        if (data.preData.mode == "attack") {
            sourceTypeIcon = "fa-fist-raised";
            summary =
                data.preData.source.name +
                (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
                data.postData.characteristics[0].res +
                (data.postData.damage ? ", <b>TP: </b>" + data.postData.damage : "");
        }
        else if (data.preData.mode == "parry") {
            sourceTypeIcon = "fa-shield-alt";
            summary =
                data.preData.source.name +
                (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
                data.postData.characteristics[0].res;
        }
        
    }
    else if (sourceType == "rangeweapon") {
        sourceTypeIcon = "fa-fist-raised";
        summary =
            data.preData.source.name +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            data.postData.characteristics[0].res +
            (data.postData.damage ? ", <b>TP: </b>" + data.postData.damage : "");
    }
    else if (sourceType == "spell") {
        sourceTypeIcon = "fa-scroll";
        summary =
            data.preData.source.name +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            "<b>FP: </b>" + data.postData.result +
            (data.postData.qualityStep ? ", <b>QS: </b>" + data.postData.qualityStep : "") +
            (data.postData.damage ? ", <b>TP: </b>" + data.postData.damage : "");
    }
    else if (sourceType == "char") {
        sourceTypeIcon = "fa-certificate";
        summary =
            game.i18n.localize(data.preData.source.data.label) +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            data.postData.characteristics[0].res;
    }
    else if (sourceType == "regenerate") {
        sourceTypeIcon = "fa-bed";
        summary =
            data.title +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            "<b>LeP: </b>" + data.postData.LeP +
            (data.postData.AsP ? ", <b>AsP: </b>" + data.postData.AsP : "") +
            (data.postData.KaP ? ", <b>KaP: </b>" + data.postData.KaP : "");
    }
    else if (sourceType == "dodge") {
        sourceTypeIcon = "fa-running";
        summary =
            game.i18n.localize(sourceType) +
            (data.postData.modifiers != 0 ? " " + data.postData.modifiers : "") + ": " +
            data.postData.characteristics[0].res;
    }
    else {
        sourceTypeIcon = "fa-question";
        summary = "Unknown Source Type";
    }

    return {
        sourceTypeIcon: sourceTypeIcon,
        summary: summary
    };

}