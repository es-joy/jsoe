function cov_v0k20jwv6(){var path="/Users/brett/jsoe/src/fundamentalTypes/voidType.js";var hash="4e5a4f96c11b6488ed57b8799245c3beb38fbf8b";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"/Users/brett/jsoe/src/fundamentalTypes/voidType.js",statementMap:{"0":{start:{line:6,column:17},end:{line:43,column:1}},"1":{start:{line:10,column:4},end:{line:10,column:27}},"2":{start:{line:13,column:4},end:{line:13,column:30}},"3":{start:{line:16,column:4},end:{line:18,column:16}},"4":{start:{line:21,column:4},end:{line:24,column:17}},"5":{start:{line:31,column:4},end:{line:41,column:7}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:9,column:2},end:{line:9,column:3}},loc:{start:{line:9,column:17},end:{line:11,column:3}},line:9},"1":{name:"(anonymous_1)",decl:{start:{line:12,column:2},end:{line:12,column:3}},loc:{start:{line:12,column:21},end:{line:14,column:3}},line:12},"2":{name:"(anonymous_2)",decl:{start:{line:15,column:2},end:{line:15,column:3}},loc:{start:{line:15,column:14},end:{line:19,column:3}},line:15},"3":{name:"(anonymous_3)",decl:{start:{line:20,column:2},end:{line:20,column:3}},loc:{start:{line:20,column:34},end:{line:25,column:3}},line:20},"4":{name:"(anonymous_4)",decl:{start:{line:30,column:2},end:{line:30,column:3}},loc:{start:{line:30,column:27},end:{line:42,column:3}},line:30}},branchMap:{"0":{loc:{start:{line:23,column:13},end:{line:23,column:62}},type:"binary-expr",locations:[{start:{line:23,column:13},end:{line:23,column:46}},{start:{line:23,column:50},end:{line:23,column:62}}],line:23}},s:{"0":0,"1":0,"2":0,"3":0,"4":0,"5":0},f:{"0":0,"1":0,"2":0,"3":0,"4":0},b:{"0":[0,0]},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"4e5a4f96c11b6488ed57b8799245c3beb38fbf8b"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_v0k20jwv6=function(){return actualCoverage;};}return actualCoverage;}cov_v0k20jwv6();import{$e}from'../utils/templateUtils.js';/**
 * @type {import('../types.js').TypeObject}
 */const voidType=(cov_v0k20jwv6().s[0]++,{stringRegex:/^void$/u,option:['Void'],valueMatch(x){cov_v0k20jwv6().f[0]++;cov_v0k20jwv6().s[1]++;return x===undefined;},toValue(/* _s */){cov_v0k20jwv6().f[1]++;cov_v0k20jwv6().s[2]++;return{value:undefined};},getValue(){cov_v0k20jwv6().f[2]++;cov_v0k20jwv6().s[3]++;return/** @type {import('../types.js').ToValue} */this.toValue('').value;},viewUI({specificSchemaObject}){cov_v0k20jwv6().f[3]++;cov_v0k20jwv6().s[4]++;return['i',{dataset:{type:'void'},title:(cov_v0k20jwv6().b[0][0]++,specificSchemaObject?.description)??(cov_v0k20jwv6().b[0][1]++,'(a `void`)')},['void']];},/* istanbul ignore next -- No dupe keys, array refs, or validation */getInput({root}){return/** @type {HTMLInputElement} */$e(root,'input');},editUI({typeNamespace}){cov_v0k20jwv6().f[4]++;cov_v0k20jwv6().s[5]++;return['div',{dataset:{type:'void'}},[['label',['Void',['input',{type:'checkbox',name:`${typeNamespace}-void`,checked:true,disabled:true}]]]]];}});export default voidType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3ZfdjBrMjBqd3Y2IiwiYWN0dWFsQ292ZXJhZ2UiLCIkZSIsInZvaWRUeXBlIiwicyIsInN0cmluZ1JlZ2V4Iiwib3B0aW9uIiwidmFsdWVNYXRjaCIsIngiLCJmIiwidW5kZWZpbmVkIiwidG9WYWx1ZSIsInZhbHVlIiwiZ2V0VmFsdWUiLCJ2aWV3VUkiLCJzcGVjaWZpY1NjaGVtYU9iamVjdCIsImRhdGFzZXQiLCJ0eXBlIiwidGl0bGUiLCJiIiwiZGVzY3JpcHRpb24iLCJnZXRJbnB1dCIsInJvb3QiLCJlZGl0VUkiLCJ0eXBlTmFtZXNwYWNlIiwibmFtZSIsImNoZWNrZWQiLCJkaXNhYmxlZCJdLCJzb3VyY2VzIjpbInZvaWRUeXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7JGV9IGZyb20gJy4uL3V0aWxzL3RlbXBsYXRlVXRpbHMuanMnO1xuXG4vKipcbiAqIEB0eXBlIHtpbXBvcnQoJy4uL3R5cGVzLmpzJykuVHlwZU9iamVjdH1cbiAqL1xuY29uc3Qgdm9pZFR5cGUgPSB7XG4gIHN0cmluZ1JlZ2V4OiAvXnZvaWQkL3UsXG4gIG9wdGlvbjogWydWb2lkJ10sXG4gIHZhbHVlTWF0Y2ggKHgpIHtcbiAgICByZXR1cm4geCA9PT0gdW5kZWZpbmVkO1xuICB9LFxuICB0b1ZhbHVlICgvKiBfcyAqLykge1xuICAgIHJldHVybiB7dmFsdWU6IHVuZGVmaW5lZH07XG4gIH0sXG4gIGdldFZhbHVlICgpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtpbXBvcnQoJy4uL3R5cGVzLmpzJykuVG9WYWx1ZX0gKi8gKFxuICAgICAgdGhpcy50b1ZhbHVlXG4gICAgKSgnJykudmFsdWU7XG4gIH0sXG4gIHZpZXdVSSAoe3NwZWNpZmljU2NoZW1hT2JqZWN0fSkge1xuICAgIHJldHVybiBbJ2knLCB7XG4gICAgICBkYXRhc2V0OiB7dHlwZTogJ3ZvaWQnfSxcbiAgICAgIHRpdGxlOiBzcGVjaWZpY1NjaGVtYU9iamVjdD8uZGVzY3JpcHRpb24gPz8gJyhhIGB2b2lkYCknXG4gICAgfSwgWyd2b2lkJ11dO1xuICB9LFxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtLSBObyBkdXBlIGtleXMsIGFycmF5IHJlZnMsIG9yIHZhbGlkYXRpb24gKi9cbiAgZ2V0SW5wdXQgKHtyb290fSkge1xuICAgIHJldHVybiAvKiogQHR5cGUge0hUTUxJbnB1dEVsZW1lbnR9ICovICgkZShyb290LCAnaW5wdXQnKSk7XG4gIH0sXG4gIGVkaXRVSSAoe3R5cGVOYW1lc3BhY2V9KSB7XG4gICAgcmV0dXJuIFsnZGl2Jywge2RhdGFzZXQ6IHt0eXBlOiAndm9pZCd9fSwgW1xuICAgICAgWydsYWJlbCcsIFtcbiAgICAgICAgJ1ZvaWQnLFxuICAgICAgICBbJ2lucHV0Jywge1xuICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgbmFtZTogYCR7dHlwZU5hbWVzcGFjZX0tdm9pZGAsXG4gICAgICAgICAgY2hlY2tlZDogdHJ1ZSxcbiAgICAgICAgICBkaXNhYmxlZDogdHJ1ZVxuICAgICAgICB9XVxuICAgICAgXV1cbiAgICBdXTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdm9pZFR5cGU7XG4iXSwibWFwcGluZ3MiOiIrM0RBZVk7QUFBQUEsYUFBQSxTQUFBQSxDQUFBLFNBQUFDLGNBQUEsV0FBQUEsY0FBQSxFQUFBRCxhQUFBLEdBZlosT0FBUUUsRUFBRSxLQUFPLDJCQUEyQixDQUU1QztBQUNBO0FBQ0EsR0FDQSxLQUFNLENBQUFDLFFBQVEsRUFBQUgsYUFBQSxHQUFBSSxDQUFBLE1BQUcsQ0FDZkMsV0FBVyxDQUFFLFNBQVMsQ0FDdEJDLE1BQU0sQ0FBRSxDQUFDLE1BQU0sQ0FBQyxDQUNoQkMsVUFBVUEsQ0FBRUMsQ0FBQyxDQUFFLENBQUFSLGFBQUEsR0FBQVMsQ0FBQSxNQUFBVCxhQUFBLEdBQUFJLENBQUEsTUFDYixNQUFPLENBQUFJLENBQUMsR0FBS0UsU0FBUyxDQUN4QixDQUFDLENBQ0RDLE9BQU9BLENBQUUsU0FBVSxDQUFBWCxhQUFBLEdBQUFTLENBQUEsTUFBQVQsYUFBQSxHQUFBSSxDQUFBLE1BQ2pCLE1BQU8sQ0FBQ1EsS0FBSyxDQUFFRixTQUFTLENBQUMsQ0FDM0IsQ0FBQyxDQUNERyxRQUFRQSxDQUFBLENBQUksQ0FBQWIsYUFBQSxHQUFBUyxDQUFBLE1BQUFULGFBQUEsR0FBQUksQ0FBQSxNQUNWLE1BQU8sNENBQ0wsSUFBSSxDQUFDTyxPQUFPLENBQ1osRUFBRSxDQUFDLENBQUNDLEtBQUssQ0FDYixDQUFDLENBQ0RFLE1BQU1BLENBQUUsQ0FBQ0Msb0JBQW9CLENBQUMsQ0FBRSxDQUFBZixhQUFBLEdBQUFTLENBQUEsTUFBQVQsYUFBQSxHQUFBSSxDQUFBLE1BQzlCLE1BQU8sQ0FBQyxHQUFHLENBQUUsQ0FDWFksT0FBTyxDQUFFLENBQUNDLElBQUksQ0FBRSxNQUFNLENBQUMsQ0FDdkJDLEtBQUssQ0FBRSxDQUFBbEIsYUFBQSxHQUFBbUIsQ0FBQSxTQUFBSixvQkFBb0IsRUFBRUssV0FBVyxJQUFBcEIsYUFBQSxHQUFBbUIsQ0FBQSxTQUFJLFlBQVksQ0FDMUQsQ0FBQyxDQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FDZCxDQUFDLENBQ0QscUVBQ0FFLFFBQVFBLENBQUUsQ0FBQ0MsSUFBSSxDQUFDLENBQUUsQ0FDaEIsTUFBTywrQkFBaUNwQixFQUFFLENBQUNvQixJQUFJLENBQUUsT0FBTyxDQUFDLENBQzNELENBQUMsQ0FDREMsTUFBTUEsQ0FBRSxDQUFDQyxhQUFhLENBQUMsQ0FBRSxDQUFBeEIsYUFBQSxHQUFBUyxDQUFBLE1BQUFULGFBQUEsR0FBQUksQ0FBQSxNQUN2QixNQUFPLENBQUMsS0FBSyxDQUFFLENBQUNZLE9BQU8sQ0FBRSxDQUFDQyxJQUFJLENBQUUsTUFBTSxDQUFDLENBQUMsQ0FBRSxDQUN4QyxDQUFDLE9BQU8sQ0FBRSxDQUNSLE1BQU0sQ0FDTixDQUFDLE9BQU8sQ0FBRSxDQUNSQSxJQUFJLENBQUUsVUFBVSxDQUNoQlEsSUFBSSxDQUFFLEdBQUdELGFBQWEsT0FBTyxDQUM3QkUsT0FBTyxDQUFFLElBQUksQ0FDYkMsUUFBUSxDQUFFLElBQ1osQ0FBQyxDQUFDLENBQ0gsQ0FBQyxDQUNILENBQUMsQ0FDSixDQUNGLENBQUMsRUFFRCxjQUFlLENBQUF4QixRQUFRIiwiaWdub3JlTGlzdCI6W119