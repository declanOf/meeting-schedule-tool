    const App = class
    {
        #meetings;

        constructor()
        {
            $(document).ready(() => {
                if (configuration.initialized) {
                    new Promise((ready) => this.buildMeetings(ready))
                        .then(this.buildPage.bind(this));
                } else {
                    new Installer();
                }
            });
        }

        buildMeetings(ready) {
            this.#meetings = new Meetings(configuration, ready);
        }

        buildPage() {
            if (this.#meetings.isValid) {
                configuration.addMeetingKeys(this.#meetings);
            }

            /**
             * Separate out:
             *  Style addition
             *  controls (content & handlers) addition
             */
            this.addScreenStyle()
                .addGlobalStyle()
                .addPrintStyle()
                .addHeader()
                .addSections()
                .addPrintButton()
                .addRefreshButton()
                .addControls()
                .addBehaviour();
        }

        addPrintButton() {
            if ($("#print-page").length > 0) {
                $("#print-page").remove();
            }

            const printButton = $(`<button id="print-page" style="display: none;">Print</button>`);

            $("div.page").prepend(printButton);

            printButton.on("click", (event) => window.print());

            return this;
        }

        addRefreshButton() {
            const refreshSchedule = (event) => {
                event.preventDefault();

                const prefix = configuration.activeConfigurationKey;

                localStorage.setItem(prefix + "timestamp", 0);

                location.reload();
            };

            if ($("#refresh-schedule").length > 0) {
                $("#refresh-schedule").remove();
            }

            const refreshButton = $(`<button id="refresh-schedule" style="display: none;">Refresh</button>`)

            $("div.page").prepend(refreshButton);

            refreshButton.on("click", refreshSchedule);

            return this;
        }

        addGlobalStyle() {
            if ($("#global-style").length > 0) {
                $("#global-style").remove();
            }

            const globalStyleEngine = Handlebars.compile(GlobalStyleTemplate);

            const globalStyle = globalStyleEngine({
                lineHeight: configuration.settings.documentHeader.lineHeight,
                keyLineHeight: configuration.settings.documentHeader.keyLineHeight,
                documentFooterTopPadding: configuration.settings.documentFooterTopPadding,
                sectionTitleTopPadding: configuration.settings.sectionTitleTopPadding,
                pagePadding: configuration.settings.padding,
            });

            console.log({
                lineHeight: configuration.settings.documentHeader.lineHeight,
                keyLineHeight: configuration.settings.documentHeader.keyLineHeight,
                documentFooterTopPadding: configuration.settings.documentFooterTopPadding,
                sectionTitleTopPadding: configuration.settings.sectionTitleTopPadding,
            })
            $(document.head).append(globalStyle);

            return this;
        }

        addScreenStyle() {
            if ($("#screen-style").length > 0) {
                $("#screen-style").remove();
            }

            const pageSizeData = PageSizes.find((element) => element.size === configuration.settings.pageSize);

            const pageWidth = (configuration.settings.pageOrientation === "portrait")
                ? pageSizeData.width
                : pageSizeData.height;

            const screenStyleEngine = Handlebars.compile(ScreenStyleTemplate);

            const screenStyle = screenStyleEngine({pageWidth: pageWidth});

            $(document.head).append(screenStyle);

            return this;
        }

        addPrintStyle() {
            if ($("#print-style").length > 0) {
                $("#print-style").remove();
            }

            const printStyleEngine = Handlebars.compile(PrintStyleTemplate);

            const printStyle = printStyleEngine({
                pageSize: configuration.settings.pageSize,
                pageOrientation: configuration.settings.pageOrientation,
                margin: configuration.settings.margin
            });

            $(document.head).append(printStyle);

            return this;
        }

        addControls() {
            if ($("div#controls").html().length > 0) {
                $("div#controls").html("");
            }

            const controls = new Controls(configuration, this.#meetings);

            const controlsContent = controls.render();

            $('div#controls').append(controlsContent);

            controls.assignHandlers();

            return this;
        };

        addBehaviour() {
            const configurationDisplay = (event) => {
                const flexContainer = $("div#controls div.flex-container");

                if (flexContainer.hasClass("show")) {
                    flexContainer.removeClass("show").addClass("hide");
                } else {
                    flexContainer.removeClass("hide").addClass("show");
                }
            };

            $(".configuration-display").on("click", configurationDisplay);

            const expandSection = (event) => $(event.target).parents("div.section").addClass("expanded").removeClass("collapsed");

            $(".expand-section").on("click", expandSection)

            const collapseSection = (event) => $(event.target).parents("div.section").addClass("collapsed").removeClass("expanded");

            $(".collapse-section").on("click", collapseSection);

            const removeReplacement = (event) => {
                event.preventDefault();

                (new Configuration()).setDirty(true);

                if (window.confirm("Remove this text replacement?")) {
                    $(event.target).parents("p.replacement").remove();
                }
            };

            $(".remove-replacement").on("click", removeReplacement);

            window.scrollTo(0,0);

            return this;
        };

        addHeader() {
            if (!this.#meetings.isValid) {
                return this;
            }

            if ($("div.page table.header").length > 0) {
                $("div.page table.header").remove();
            }
            const header = new DocumentHeader(configuration);

            $('div.page').prepend(header.render());

            return this;
        };

        addSections() {
            if (!this.#meetings.isValid) {
                this.appendError()
                return this;
            }

            const sections = new Schedule(configuration, this.#meetings);

            sections.render();

            return this;
        };

        appendError() {
            $(".page").addClass("error");
            $(".page").append($(`<h2>No valid meetings</h2>`));
            $(".page").append(`<p>Please check your configuration and try again.</p>`);
        }
    };