# ローカルサーバセットアップ方法

1. NodeJSのインストール

- Ubuntuの場合

```
sudo apt update
sudo apt install -y nodejs npm
```

- Rocky Linuxの場合

```
sudo dnf install nodejs -y
```

2. MitoSearchのインストールおよび起動

```
git clone https://github.com/suikoucalender/mitosearch.git

cd mitosearch/Mitosearch
npm start
```

これでhttp://localhost:3003/ にアクセスするとMitoSearchにアクセス可能。


