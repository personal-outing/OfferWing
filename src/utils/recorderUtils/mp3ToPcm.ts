import Recorder from "recorder-core";
import "recorder-core/src/engine/mp3.js";
import "recorder-core/src/engine/mp3-engine.js";

Recorder.Mp32Other=function(newSet,mp3Blob,True,False){
	if(!Recorder.GetContext()){//强制激活Recorder.Ctx 不支持大概率也不支持解码
		False&&False("浏览器不支持mp3解码");
		return;
	};
	
	var reader=new FileReader();
	reader.onloadend=function(){
		var ctx=Recorder.Ctx;
		ctx.decodeAudioData(reader.result,function(raw){
			var src=raw.getChannelData(0);
			var sampleRate=raw.sampleRate;
			
			var pcm=new Int16Array(src.length);
			for(var i=0;i<src.length;i++){//floatTo16BitPCM 
				var s=Math.max(-1,Math.min(1,src[i]));
				s=s<0?s*0x8000:s*0x7FFF;
				pcm[i]=s;
			};
			
			var rec=Recorder(newSet).mock(pcm,sampleRate);
			rec.stop(function(blob,duration){
				True(blob,duration,rec);
			},False);
		},function(e){
			False&&False("mp3解码失败:"+e.message);
		});
	};
	reader.readAsArrayBuffer(mp3Blob);
};
//=====END=========================



//转换测试
var test=function(mp3Blob){
	if(!mp3Blob){
		Runtime.Log("无数据源，请先录音",1);
		return;
	};
	var set={
		type:"pcm"
		,sampleRate:48000
		,bitRate:16
	};
	
	//数据格式一 Blob
	Recorder.Mp32Other(set,mp3Blob,function(blob,duration,rec){
		console.log(blob,(window.URL||webkitURL).createObjectURL(blob));
		Runtime.Log("mp3 src blob 转换成 wav...",2);
		Runtime.LogAudio(blob,duration,rec);
	},function(msg){
		Runtime.Log(msg,1);
	});
	
	//数据格式二 Base64 模拟
	var reader=new FileReader();
	reader.onloadend=function(){
		var base64=(/.+;\s*base64\s*,\s*(.+)$/i.exec(reader.result)||[])[1];
		
		//数据格式二核心代码，以上代码无关紧要
		var bstr=atob(base64),n=bstr.length,u8arr=new Uint8Array(n);
		while(n--){
			u8arr[n]=bstr.charCodeAt(n);
		};
		
		Recorder.Mp32Other(set,new Blob([u8arr.buffer]),function(blob,duration,rec){
			Runtime.Log("mp3 as base64 转换成 wav...",2);
			Runtime.LogAudio(blob,duration,rec);
		},function(msg){
			Runtime.Log(msg,1);
		});
	};
	reader.readAsDataURL(mp3Blob);
};






//调用录音
var rec;
function recStart(){
	rec=Recorder({
		type:"mp3"
		,sampleRate:32000
		,bitRate:96
		,onProcess:function(buffers,powerLevel,bufferDuration,bufferSampleRate){
			Runtime.Process.apply(null,arguments);
		}
	});
	var t=setTimeout(function(){
		Runtime.Log("无法录音：权限请求被忽略（超时假装手动点击了确认对话框）",1);
	},8000);
	
	rec.open(function(){//打开麦克风授权获得相关资源
		clearTimeout(t);
		rec.start();//开始录音
	},function(msg,isUserNotAllow){//用户拒绝未授权或不支持
		clearTimeout(t);
		Runtime.Log((isUserNotAllow?"UserNotAllow，":"")+"无法录音:"+msg, 1);
	});
};
function recStop(){
	if(!rec){
		Runtime.Log("未开始录音",1);
		return;
	}
	rec.stop(function(blob,duration){
		Runtime.LogAudio(blob,duration,rec);
		
		test(blob);
	},function(msg){
		Runtime.Log("录音失败:"+msg, 1);
	},true);
};
