class SingleDaysSection extends GenericBlockSection
{
    // figure out whether we're excluding multi-days from the listing
    // should exclude meetings matched by other filters, too

    #displayFriendlyRows;

    constructor(meetings, section, configuration, sectionIndex)
    {
        super(meetings, section, sectionIndex, configuration);
    }

    /**
     * Create data blocks of each day
     * Renders seven blocks of content first
     * Then combines them in accordance with the days of week order
     * Then adds a main header,. then returns all as a string
     * @returns
     */
    render()
    {
        let data = this.meetings;

        // get arrays of meetings broken into separate arrays of days
        const daySets = this.getDaySets();

        const daysContent = Object.entries(daySets).map((entry, index) => [entry[0], this.renderDay(entry, index)]);

        // for each day, render the day
        let daysOfWeekContent = Object.fromEntries(daysContent);

        // add title, then loop array to add content
        const orderedContent = this.getOrderedDaysContent(daysOfWeekContent);

        return orderedContent;
    }

    get configuration()
    {
        if (configuration) {
            return configuration;
        }

        configuration = new Configuration();

        return configuration;
    }

    getDayHeaders(index)
    {
        if (!configuration.settings.showColumnHeadersForEachDay && index > 0) {
            return null;
        }

        const headers = this.section.columns[index].map((column) => {
            return {"key": column.source, "name": column.title, "width": column.width};
        });

        return headers;
    }

    /**
     *
     * @param {*} data Contains day string, columns, and rows
     * @returns
     */
    renderDay(data, index)
    {
        const repeatDayAndColumnNameTemplateEngine = Handlebars.compile(repeatDayAndColumnNameTemplate);
        const rowTemplateEngine = Handlebars.compile(rowTemplate);

        let content = "";

        const dayName = this.days[data[0]];

        let rows = [];

        const columnCount = this.section.columns.length;

        const headers = this.getDayHeaders(index);

        data[1] = data[1].sort((a, b) => {
            let aTime = parseInt(a[1].time.replace(":", ""));

            let bTime = parseInt(b[1].time.replace(":", ""));

            if (configuration.settings.midnightMeetingPosition === "end" || !("midnightMeetingPosition" in this.configuration.settings)) {
                if (aTime === 0) {
                    aTime = 2359;
                }

                if (bTime === 0) {
                    bTime = 2359;
                }
            }

            return aTime - bTime;
        });

        Object.entries(data[1]).forEach((entry) => {
            const rowKey = entry[1][0];
            const meeting = entry[1][1];

            let row = {"key": rowKey.replace(/[: ]/g, "_"), "columns": {}};

            this.section.columns[index].forEach((column) => {
                if (column.source === "types") {
                    row.columns[column.source] = { "key": column.source, "value": this.#getTypesFromMeeting(meeting) };
                } else if (column.source in meeting) {
                    if (column.source === "name") {
                        row.columns[column.source] = { "key": column.source, "value": this.#getFormattedName(meeting[column.source]) };
                    } else {
                        row.columns[column.source] = { "key": column.source, "value": meeting[column.source] };
                    }
                } else if (column.source === "locationAddress") {
                    row.columns[column.source] = { "key": column.source, "value": this.#getFormattedAddress(meeting) };
                } else {
                    console.error("An unknown column type was found in the fullowing meeting:", meeting)
                    console.error("Column", column);
                }
            });

            rows.push(rowTemplateEngine(row));
        });

        const handlebarsData = {
            "meetingFontSize": configuration.settings.meetingFontSize,
            "day": dayName,
            "headers": headers,
            "rows": rows,
            "sectionIndex": this.sectionIndex,
            "dayIndex": index
        };

        content = repeatDayAndColumnNameTemplateEngine(handlebarsData);

        return content;
    }

    #getFormattedAddress(meeting)
    {
        let locationAddress = "";

        let address = meeting['formatted_address'] ?? "";

        let location = meeting['location'] ?? "";

        configuration.settings.addressReplacements.forEach((replacement) => {
            if (address) {
                address = address.replace(new RegExp(replacement.old), replacement.new);
            }

            if (location) {
                location = location.replace(new RegExp(replacement.old), replacement.new);
            }
        });

        if (address !== location && location.length > 0 && address.length > 0) {
            locationAddress = `${location}: ${address}`;
        } else if (location.length > 0) {
            locationAddress = location;
        } else if (address.length > 0) {
            locationAddress = address;
        }

        return locationAddress;
    }

    #getFormattedName(name)
    {
        configuration.settings.nameReplacements.forEach((replacement) => {
            name = name.replace(new RegExp(replacement.old), replacement.new);
        });

        return name;
    }

    #getTypesFromMeeting(meeting)
    {
        if (!("types" in meeting)) {
            return " ";
        }

        let displayTypes = [];

        const configuredTypes = this.configuration.settings.types;

        meeting.types.forEach((type) => {
            if (configuredTypes[type].showInColumn) {
                displayTypes.push(configuredTypes[type].displaySymbol);
            }
        });

        return displayTypes.join(" ");
    }

    getDaySets()
    {
        let meetingsByDay = {};

        Object.keys(this.days).forEach((day) => {
            meetingsByDay[day] = Object.entries(this.meetings).filter((entry) => entry[1].day === day)
        });

        return meetingsByDay;
    }

    getOrderedDaysContent(daysContent)
    {
        let content = "";

        Object.keys(this.days).forEach((day) => content += daysContent[day]);

        return content;
    }

    get days()
    {
        const order = this.orderOfDays ? this.orderOfDays : "SundayFirst";

        switch (order) {
            case 'SundayFirst':
                return {
                   "Su": "Sunday",
                    "M": "Monday",
                    "T": "Tuesday",
                    "W": "Wednesday",
                   "Th": "Thursday",
                    "F": "Friday",
                    "S": "Saturday"
                };
            break;

            case 'MondayFirst':
                return {
                    "M": "Monday",
                    "T": "Tuesday",
                    "W": "Wednesday",
                   "Th": "Thursday",
                    "F": "Friday",
                    "S": "Saturday",
                   "Su": "Sunday"
                };
            break;

            case 'SaturdayFirst':
                return {
                    "S": "Saturday",
                   "Su": "Sunday",
                    "M": "Monday",
                    "T": "Tuesday",
                    "W": "Wednesday",
                   "Th": "Thursday",
                    "F": "Friday"
                };
            break;
        }
    }
}
