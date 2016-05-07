class Editor extends React.Component{
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this)
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
            wrap: true,
            autoScrollEditorIntoView: true
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
    }

    render() {
        return <div
            id={this.props.name}
            ref={ (element) => this.init(element) }
        >
        </div>;
    }
}