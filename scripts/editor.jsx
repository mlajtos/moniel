class Editor extends React.Component{
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.marker = null;
    }

    onChange() {
        if (this.props.onChange) {
            var newValue = this.editor.getValue();
            this.props.onChange(newValue);
        }
    }

    init(element) {
        this.container = element;
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
            fontFamily: "Fira  Code",
            //showLineNumbers: false,
            //showGutter: false
        });
        this.editor.$blockScrolling = Infinity;
        this.editor.on("change", this.onChange);
        if (this.props.defaultValue){
            this.editor.setValue(this.props.defaultValue, -1);
        }
    }

    componentWillReceiveProps(nextProps) {
        var anno = nextProps.annotations;

        if (nextProps.annotations) {
            var position = this.editor.session.doc.indexToPosition(anno.position);
            var message = anno.message

            this.editor.session.setAnnotations([{
                row: position.row,
                column: position.column,
                text: message,
                type: "error" // also warning and information
            }]);
            this.editor.execCommand("goToNextError");
        } else {
            this.editor.session.clearAnnotations();
            this.editor.execCommand("goToNextError");
        }

        if (nextProps.value) {
            this.editor.setValue(nextProps.value, -1);
        }

        if (nextProps.highlightRange) {
            this.editor.getSession().removeMarker(this.marker);
            //console.log("highlightRange", nextProps.highlightRange);
            var Range = require('ace/range').Range;
            var start = this.editor.session.doc.indexToPosition(nextProps.highlightRange.startIdx);
            var end = this.editor.session.doc.indexToPosition(nextProps.highlightRange.endIdx);
            var range = new Range(start.row, start.column, end.row, end.column);
            //console.log(range);
            this.marker = this.editor.getSession().addMarker(range, "highlight", "text");
        }
    }

    render() {
        return <div
            id={this.props.name}
            ref={ (element) => this.init(element) }
        >
        </div>;
    }
}