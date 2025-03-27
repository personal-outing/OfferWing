if [ ! -z "$2" ]; then
    if [ "$1"x = "pre"x ]; then
        echo "发布到预发...\n"
        scp -r /Users/fredxia/Documents/workspace/interviewDog/new_interviewDog/prebuild/ root@120.78.126.163:/var/www/
        exit
    fi

    curl -X POST https://api.offerwing.cn/api/userService/updateAPPVersion \
     -H "Content-Type: application/json" \
     -d "{\"appVersion\": \"$2\",\"password\":\"apiPassword\"}"

    if [ "$1"x = "prod"x ]; then
        echo "发布到线上...\n"
        scp -r /Users/fredxia/Documents/workspace/interviewDog/new_interviewDog/build/ root@47.107.249.178:/var/www/
        exit
    fi
fi

echo "git提交...\n"


if  [ ! -n "$1" ];then
    echo "error: 请输入commit信息"
    exit
fi

git add .
git commit -m "$1"
git push

echo "发布+打包...\n"
npm run release
npm run build

echo "版本更改后git提交...\n"
git add .
git commit -m "release: update latest version"
git push
