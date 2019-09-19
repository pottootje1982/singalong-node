export class FindReplace {
    private replaceStr: string;
    private find: string;

    constructor(find: string, replace: string) {
        this.replaceStr = replace;
        this.find = find;
    }

    replace(str: string) {
        return str.replace(this.find, this.replaceStr);
    }
}