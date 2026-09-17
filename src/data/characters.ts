import {sceneArt} from './backgrounds'
export const characters=[
 {id:'xuzhiwei',name:'许知微',title:'23 岁 / 刚考完公务员 / 重建协调者',scene:'qingya',summary:'我没有拯救世界的办法，先把水弄出来。'},
 {id:'zhaojianguo',name:'赵建国',title:'景区维修 / 基础设施',scene:'qingya',summary:'一串旧钥匙，一台旧泵，把三年前停下的地方重新接起来。'},
 {id:'zhouyun',name:'周芸',title:'医疗与卫生 / 临时诊疗区',scene:'refugees',summary:'饮用水和杂用水分开。照顾人的事，不能凭运气。'},
 {id:'wudahai',name:'吴大海',title:'公共厨房 / 后勤',scene:'qingya',summary:'下一锅饭要让多少人吃上，账得算清。'},
 {id:'liangce',name:'梁策',title:'官方救援 / 安全协调',scene:'exam',summary:'先确认边界，再组织行动。警戒和救治交给专业人员。'},
 {id:'wuxiao',name:'无晓',title:'百鬼街来客 / 控水者',scene:'market',summary:'从真实江面借水，也会疲惫。力量始终有边界。'},
 {id:'zhenzhi',name:'镇纸',title:'纸铺书生 / 机械纸虎',scene:'market',summary:'铜销、竹骨、纸层与红绳。纸会湿，街契也会裂。'},
 {id:'tanniang',name:'摊娘',title:'百鬼街商户 / 协商代表',scene:'market',summary:'给我们一处能落脚的铺子，再谈怎么把生活过下去。'}
].map(c=>({...c,portrait:sceneArt(c.scene),hero:sceneArt(c.scene),quality:'场景示意 · 人物设定'}))
