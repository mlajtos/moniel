class Editor extends React.Component{
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.marker = null;
        this.markers = [];
    }

    onChange() {
        this.removeMarkers();

        if (this.props.onChange) {
            var newValue = this.editor.getValue();
            this.props.onChange(newValue);
        }
    }

    init(element) {
        this.container = element;
    }

    setValue(value) {
        this.editor.setValue(value, -1);
    }

    removeMarkers() {
        this.markers.map(marker => this.editor.session.removeMarker(marker));
        this.markers = [];
    }

    onCursorPositionChanged(event, selection) {
        let m = this.editor.session.getMarkers();
        let c = selection.getCursor();
        let markers = this.markers.map(id => m[id]);
        let cursorOverMarker = markers.map(marker => marker.range.contains(c.row, c.column)).reduce( (prev, curr) => prev || curr, false);

        if (cursorOverMarker) {
            this.editor.execCommand("goToNextError");
        }
    }

    componentDidMount() {
        this.editor = ace.edit(this.container);
        this.editor.getSession().setMode("ace/mode/" + this.props.mode);
        this.editor.setTheme("ace/theme/" + this.props.theme);
        this.editor.setShowPrintMargin(false);
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
            wrap: true,
            autoScrollEditorIntoView: true,
            fontFamily: "Fira Code",
            showLineNumbers: true,
            showGutter: true
        });
        this.editor.$blockScrolling = Infinity;
        this.editor.container.style.lineHeight = 1.7;

        if (this.props.defaultValue){
            this.editor.setValue(this.props.defaultValue, -1);
        }

        this.editor.on("change", this.onChange);
        this.editor.selection.on("changeCursor", this.onCursorPositionChanged.bind(this));
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.issues) {
            var annotations = nextProps.issues.map(issue => {
                let position = this.editor.session.doc.indexToPosition(issue.position.start);
                return {
                    row: position.row,
                    column: position.column,
                    text: issue.message,
                    type: issue.type
                }
            });

            this.editor.session.setAnnotations(annotations);
            //this.editor.execCommand("goToNextError");

            var Range = require('ace/range').Range;

            this.removeMarkers();

            var markers = nextProps.issues.map(issue => {
                let position = {
                    start: this.editor.session.doc.indexToPosition(issue.position.start),
                    end: this.editor.session.doc.indexToPosition(issue.position.end)
                }

                let range = new Range(position.start.row, position.start.column, position.end.row, position.end.column);

                this.markers.push(this.editor.session.addMarker(range, "marker_error", "text"));
            });
        } else {
            this.editor.session.clearAnnotations();
            this.editor.execCommand("goToNextError");
        }

        if (nextProps.value) {
            this.editor.setValue(nextProps.value, -1);
        }
    }

    render() {
        return <div ref={ (element) => this.init(element) }></div>;
    }
}