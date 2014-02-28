/*!
 * jQuery UI collapse 1.10.4
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.widget.js
 */
(function($, undefined) {

    var uid = 0, hideProps = {}, showProps = {};

    hideProps.height = hideProps.paddingTop = hideProps.paddingBottom = hideProps.borderTopWidth = hideProps.borderBottomWidth = "hide";
    showProps.height = showProps.paddingTop = showProps.paddingBottom = showProps.borderTopWidth = showProps.borderBottomWidth = "show";

    $
            .widget(
                    "ui.collapse",
                    {
                        version : "1.10.4",
                        options : {
                            active : 0,
                            animate : {},
                            event : "click",
                            header : "> li > :first-child,> :not(li):even",
                            heightStyle : "auto",
                            icons : {
                                activeHeader : "ui-icon-triangle-1-s",
                                header : "ui-icon-triangle-1-e"
                            },

                            // callbacks
                            activate : null,
                            beforeActivate : null
                        },

                        _create : function() {
                            var options = this.options, active = [ true ];
                            this.element.addClass("ui-collapse ui-widget ui-helper-reset")
                            // ARIA
                            .attr("role", "tablist");

                            this._processPanels();
                            // handle negative values
                            if (typeof options.active === 'number') {
                                active[options.active] = true;
                            } else if (options.active === "all") {
                                for (var i = 0; i < this.headers.length; i++) {
                                    active[i] = true;
                                }
                            } else if (options.active === "none") {
                                active[0] = false;
                            } else if ($.isArray(options.active)) {
                                active = options.active;
                            }
                            options.active = active;
                            this._refresh();
                        },

                        _getCreateEventData : function() {
                            return {
                                header : this.active,
                                panel : !this.active.length ? $() : this.active.next(),
                                content : !this.active.length ? $() : this.active.next()
                            };
                        },

                        _createIcons : function() {
                            var icons = this.options.icons;
                            if (icons) {
                                $("<span>").addClass("ui-collapse-header-icon ui-icon " + icons.header).prependTo(
                                        this.headers);
                                this.active.children(".ui-collapse-header-icon").removeClass(icons.header).addClass(
                                        icons.activeHeader);
                                this.headers.addClass("ui-collapse-icons");
                            }
                        },

                        _destroyIcons : function() {
                            this.headers.removeClass("ui-collapse-icons").children(".ui-collapse-header-icon")
                                    .remove();
                        },

                        _destroy : function() {
                            var contents;

                            // clean up main element
                            this.element.removeClass("ui-collapse ui-widget ui-helper-reset").removeAttr("role");

                            // clean up headers
                            this.headers
                                    .removeClass(
                                            "ui-collapse-header ui-collapse-header-active ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top")
                                    .removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected")
                                    .removeAttr("aria-controls").removeAttr("tabIndex").each(function() {
                                        if (/^ui-collapse/.test(this.id)) {
                                            this.removeAttribute("id");
                                        }
                                    });
                            this._destroyIcons();

                            // clean up content panels
                            contents = this.headers
                                    .next()
                                    .css("display", "")
                                    .removeAttr("role")
                                    .removeAttr("aria-hidden")
                                    .removeAttr("aria-labelledby")
                                    .removeClass(
                                            "ui-helper-reset ui-widget-content ui-corner-bottom ui-collapse-content ui-collapse-content-active ui-state-disabled")
                                    .each(function() {
                                        if (/^ui-collapse/.test(this.id)) {
                                            this.removeAttribute("id");
                                        }
                                    });
                            if (this.options.heightStyle !== "content") {
                                contents.css("height", "");
                            }
                        },

                        _setOption : function(key, value) {
                            if (key === "active") {
                                // _activate() will handle invalid values and
                                // update this.options
                                this._activate(value);
                                return;
                            }

                            if (key === "event") {
                                if (this.options.event) {
                                    this._off(this.headers, this.options.event);
                                }
                                this._setupEvents(value);
                            }

                            this._super(key, value);

                            if (key === "icons") {
                                this._destroyIcons();
                                if (value) {
                                    this._createIcons();
                                }
                            }

                            // #5332 - opacity doesn't cascade to positioned
                            // elements in IE
                            // so we need to add the disabled class to the
                            // headers and panels
                            if (key === "disabled") {
                                this.headers.add(this.headers.next()).toggleClass("ui-state-disabled", !!value);
                            }
                        },

                        _keydown : function(event) {
                            if (event.altKey || event.ctrlKey) {
                                return;
                            }

                            var keyCode = $.ui.keyCode, length = this.headers.length, currentIndex = this.headers
                                    .index(event.target), toFocus = false;

                            switch (event.keyCode) {
                            case keyCode.RIGHT:
                            case keyCode.DOWN:
                                toFocus = this.headers[(currentIndex + 1) % length];
                                break;
                            case keyCode.LEFT:
                            case keyCode.UP:
                                toFocus = this.headers[(currentIndex - 1 + length) % length];
                                break;
                            case keyCode.SPACE:
                            case keyCode.ENTER:
                                this._eventHandler(event);
                                break;
                            case keyCode.HOME:
                                toFocus = this.headers[0];
                                break;
                            case keyCode.END:
                                toFocus = this.headers[length - 1];
                                break;
                            }

                            if (toFocus) {
                                $(event.target).attr("tabIndex", -1);
                                $(toFocus).attr("tabIndex", 0);
                                toFocus.focus();
                                event.preventDefault();
                            }
                        },

                        _panelKeyDown : function(event) {
                            if (event.keyCode === $.ui.keyCode.UP && event.ctrlKey) {
                                $(event.currentTarget).prev().focus();
                            }
                        },

                        refresh : function() {
                            var options = this.options;
                            this._processPanels();
                            options.active = [];
                            this.headers.each(function(index){
                                options.active[index] = $(this).is(".ui-collapse-header-active");
                            });
                            this._destroyIcons();
                            this._refresh();
                        },

                        _processPanels : function() {
                            this.headers = this.element.find(this.options.header).addClass(
                                    "ui-collapse-header ui-helper-reset ui-state-default ui-corner-all");

                            this.headers.next().addClass(
                                    "ui-collapse-content ui-helper-reset ui-widget-content ui-corner-bottom").filter(
                                    ":not(.ui-collapse-content-active)").hide();
                        },

                        _refresh : function() {
                            var maxHeight, options = this.options, heightStyle = options.heightStyle, parent = this.element
                                    .parent(), collapseId = this.collapseId = "ui-collapse-"
                                    + (this.element.attr("id") || ++uid);

                            this.active = this._findActive(options.active).addClass(
                                    "ui-collapse-header-active ui-state-active ui-corner-top").removeClass(
                                    "ui-corner-all");
                            this.active.next().addClass("ui-collapse-content-active").show();

                            this.headers.attr("role", "tab")
                                    .each(
                                            function(i) {
                                                var header = $(this), headerId = header.attr("id"), panel = header
                                                        .next(), panelId = panel.attr("id");
                                                if (!headerId) {
                                                    headerId = collapseId + "-header-" + i;
                                                    header.attr("id", headerId);
                                                }
                                                if (!panelId) {
                                                    panelId = collapseId + "-panel-" + i;
                                                    panel.attr("id", panelId);
                                                }
                                                header.attr("aria-controls", panelId);
                                                panel.attr("aria-labelledby", headerId);
                                            }).next().attr("role", "tabpanel");

                            this.headers.not(this.active).attr({
                                "aria-selected" : "false",
                                "aria-expanded" : "false",
                                tabIndex : -1
                            }).next().attr({
                                "aria-hidden" : "true"
                            }).hide();

                            // make sure at least one header is in the tab order
                            if (!this.active.length) {
                                this.headers.eq(0).attr("tabIndex", 0);
                            } else {
                                this.active.attr({
                                    "aria-selected" : "true",
                                    "aria-expanded" : "true",
                                    tabIndex : 0
                                }).next().attr({
                                    "aria-hidden" : "false"
                                });
                            }

                            this._createIcons();

                            this._setupEvents(options.event);

                            if (heightStyle === "fill") {
                                maxHeight = parent.height();
                                this.element.siblings(":visible").each(function() {
                                    var elem = $(this), position = elem.css("position");

                                    if (position === "absolute" || position === "fixed") {
                                        return;
                                    }
                                    maxHeight -= elem.outerHeight(true);
                                });

                                this.headers.each(function() {
                                    maxHeight -= $(this).outerHeight(true);
                                });

                                this.headers.next().each(function() {
                                    $(this).height(Math.max(0, maxHeight - $(this).innerHeight() + $(this).height()));
                                }).css("overflow", "auto");
                            } else if (heightStyle === "auto") {
                                maxHeight = 0;
                                this.headers.next().each(function() {
                                    maxHeight = Math.max(maxHeight, $(this).css("height", "").height());
                                }).height(maxHeight);
                            }
                        },

                        _activate : function(index) {
                            var active = this._findActive(index);

                            // trying to activate the already active panel
                            if (active && active.is(".ui-collapse-header-active")) {
                                return;
                            }

                            // trying to collapse, simulate a click on the
                            // currently active header
                            active = active[0];

                            this._eventHandler({
                                target : active,
                                currentTarget : active,
                                preventDefault : $.noop
                            });
                        },

                        _findActive : function(selector) {
                            if ($.isArray(selector)) {
                                return this.headers.filter(function(index) {
                                    return selector[index] === true;
                                });
                            } else if (typeof selector === "number") {
                                return this.headers.eq(selector);
                            } else {
                                return this.headers.filter(".ui-collapse-header-active");
                            }
                        },

                        _setupEvents : function(event) {
                            var events = {
                                keydown : "_keydown"
                            };
                            if (event) {
                                $.each(event.split(" "), function(index, eventName) {
                                    events[eventName] = "_eventHandler";
                                });
                            }

                            this._off(this.headers.add(this.headers.next()));
                            this._on(this.headers, events);
                            this._on(this.headers.next(), {
                                keydown : "_panelKeyDown"
                            });
                            this._hoverable(this.headers);
                            this._focusable(this.headers);
                        },

                        _eventHandler : function(event) {
                            var options = this.options, clicked = $(event.currentTarget), clickedIsActive = clicked
                                    .is(".ui-collapse-header-active"), content = clicked.next(), eventData = {
                                header : clicked,
                                panel : content,
                                clickedIsActive : clickedIsActive
                            };

                            event.preventDefault();

                            if (this._trigger("beforeActivate", event, eventData) === false) {
                                return;
                            }

                            options.active[this.headers.index(clicked)] = !clickedIsActive;

                            this._toggle(eventData);

                            if (clickedIsActive) {
                                clicked.removeClass("ui-collapse-header-active ui-state-active");
                                if (options.icons) {
                                    clicked.children(".ui-collapse-header-icon").removeClass(
                                            options.icons.activeHeader).addClass(options.icons.header);
                                }

                                clicked.next().removeClass("ui-collapse-content-active");
                            } else {
                                clicked.removeClass("ui-corner-all").addClass(
                                        "ui-collapse-header-active ui-state-active ui-corner-top");
                                if (options.icons) {
                                    clicked.children(".ui-collapse-header-icon").removeClass(options.icons.header)
                                            .addClass(options.icons.activeHeader);
                                }

                                clicked.next().addClass("ui-collapse-content-active");
                            }
                        },

                        _toggle : function(data) {
                            var content = data.panel;

                            if (this.options.animate) {
                                this._animate(data);
                            } else {
                                if (data.clickedIsActive) {
                                    content.hide();
                                } else {
                                    content.show();
                                }
                                this._toggleComplete(data);
                            }
                            if (data.clickedIsActive) {
                                content.attr({
                                    "aria-hidden" : "true"
                                }).prev().attr({
                                    "aria-selected" : "false",
                                    "tabIndex" : -1
                                });
                            } else {
                                content.attr("aria-hidden", "false").prev().attr({
                                    "aria-selected" : "true",
                                    tabIndex : 0,
                                    "aria-expanded" : "true"
                                });
                            }
                        },

                        _animate : function(data) {
                            var easing, duration, that = this, animate = this.options.animate || {}, options = animate.down
                                    || animate, complete = function() {
                                that._toggleComplete(data);
                            };

                            if (typeof options === "number") {
                                duration = options;
                            }
                            if (typeof options === "string") {
                                easing = options;
                            }
                            // fall back from options to animation in case of
                            // partial down settings
                            easing = easing || options.easing || animate.easing;
                            duration = duration || options.duration || animate.duration;

                            if (data.clickedIsActive) {
                                return data.panel.animate(hideProps, duration, easing, complete);
                            } else {
                                return data.panel.animate(showProps, duration, easing, complete);
                            }
                        },

                        _toggleComplete : function(data) {
                            this._trigger("activate", null, data);
                        }
                    });

})(jQuery);
