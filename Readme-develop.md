バクテリアも含んだ開発版のセットアップ

- 必要ファイルのダウンロード

下記のコマンドはLinuxで動かすことを想定しています。Windows Subsystem for Linuxでも可能です。WSLのセットアップ手順は、https://learn.microsoft.com/ja-jp/windows/wsl/install 参照。

```
git clone https://github.com/suikoucalender/mitosearch.git
cd mitosearch
git checkout develop
cd Mitosearch
npm install

wget http://suikou.fs.a.u-tokyo.ac.jp/yosh_data/meta/mitosearch-bacteria.tar.gz
wget http://suikou.fs.a.u-tokyo.ac.jp/yosh_data/meta/2024-05-03_output.txt
wget http://suikou.fs.a.u-tokyo.ac.jp/yosh_data/meta/downloaded_fasta_list.db3-db4.sort.txt.with-latlon
tar vxf mitosearch-bacteria.tar.gz
#フィルタリングなどした新しい結果ファイルを保存する場所を作成
mkdir mitosearch-bacteria-new
```

これで、`mitosearch-bacteria`というフォルダの中に、`db3-105.db.tsv`などのファイルがたくさん解凍される。それらは一つ一つが数百～数千個のSRRファイルの解析結果をまとめたファイルであり、例えば下記のような中身になっている。

```
id      SRR19632221
Bacteria;Proteobacteria;Gammaproteobacteria     136
Bacteria        113
Bacteria;Firmicutes;Clostridia;Lachnospirales;Lachnospiraceae   42
Bacteria;Firmicutes;Bacilli;Erysipelotrichales;Erysipelatoclostridiaceae;Erysipelatoclostridium;uncultured bacterium    33
Bacteria;Proteobacteria;Gammaproteobacteria;Enterobacterales    30
Bacteria;Firmicutes;Bacilli;Lactobacillales;Lactobacillaceae;Ligilactobacillus  26
Bacteria;Firmicutes;Clostridia;Clostridiales;Clostridiaceae;Clostridium sensu stricto 1 23
Bacteria;Firmicutes;Bacilli     23
Bacteria;Bacteroidota;Bacteroidia;Bacteroidales;Muribaculaceae;uncultured bacterium     19
Bacteria;Proteobacteria;Gammaproteobacteria;Enterobacterales;Enterobacteriaceae;Escherichia-Shigella;uncultured bacterium       16
Bacteria;Firmicutes     16
unknown 2
id      SRR19632222
Bacteria        92
Bacteria;Proteobacteria;Gammaproteobacteria     75
Bacteria;Firmicutes;Clostridia;Clostridiales;Clostridiaceae;Clostridium sensu stricto 1 51
Bacteria;Firmicutes;Bacilli     48
Bacteria;Firmicutes;Clostridia;Lachnospirales;Lachnospiraceae   45
Bacteria;Firmicutes;Bacilli;Lactobacillales;Lactobacillaceae;Ligilactobacillus  45
Bacteria;Firmicutes;Clostridia;Clostridiales;Clostridiaceae;Clostridium sensu stricto 1;Clostridium tertium     30
Bacteria;Firmicutes     30
```

idから始まる行は、ファイルの区切りを表していて、上の例だと`id      SRR19632221`からSRR19632221の解析結果が入っていて、次の`id      SRR19632222`からSRR19632222の解析結果が入っている。

`Bacteria;Proteobacteria;Gammaproteobacteria     136`などとあるのは、そのデータリードを解析したら`Bacteria;Proteobacteria;Gammaproteobacteria`が136リードあったという意味になっている。基本的には1サンプル当たり合計300リード以上のヒットがあるように調整しており、元ファイルからランダムに数百から数万リードを抜き出して解析していて、全リードを解析しているわけではない。

メタゲノムの種類(https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Undef&id=408169&lvl=3&keep=1&srchmode=1&unlock )を限定したい場合は、2024-05-03_output.txtのファイルを見て、`mitosearch-bacteria`の中のtsvファイルの中の必要なSRR IDのみを残して、新しいtsvファイルを`mitosearch-bacteria-new`に保存する。

例えば、2024-05-03_output.txtの4行目の#の前までが`marine metagenome`のSRR IDの解析結果だけをmitosearch-bacteria/db3-105.db.tsvから抜き出して、mitosearch-bacteria-new/db3-105.db.tsvに保存する。同じ処理を他のmitosearch-bacteria内のtsvファイルに対しても行う。

または、解析結果で`Bacteria;Cyanobacteria`から始まる行のみを残し、それ以外の結果はまとめて`Others`にしてしまい、`Bacteria;Cyanobacteria`の数が一つもないSRR IDは削除してしまうなどを行って、着目するバクテリアを限定するなども解析結果を見るうえで有効でしょう。

以上のようなフィルタリングを行った新しいtsvファイルがmitosearch-bacteria-newにあるとします。あとは、下記のコマンドでmitosearchに表示できます。(テストで下記の手順をとりあえず行ってみたいなら、`mitosearch-bacteria/db3-105.db.tsv`だけを`mitosearch-bacteria-new`にコピーして下記のコマンドを実行すれば良いです)

```
cd mitosearch-bacteria-new
rm -rf ../db_fish_ja
for i in *.tsv; do mkdir -p ../db_fish_ja/$i; done
for i in *.tsv; do awk -F'\t' '{if(FNR==1){print FILENAME}; if($0~"^id"){id=$2}; if(id!=""){print $0 > "../db_fish_ja/"FILENAME"/"id".input"}}' $i; done
for i in *.tsv; do awk -F'\t' '{if(FNR==1){print FILENAME > "/dev/stderr"}; if($0~"^id"){id=$2; print id"\t"FILENAME"/"id".input"}}' $i; done > ../data/fish/input_file_path.txt

awk -F'\t' 'FILENAME==ARGV[1]{a[$1]=$2} FILENAME==ARGV[2]&&$1 in a{split($4,arr,"###"); print $1"\t"arr[5]"\t"arr[4]}' ../data/fish/input_file_path.txt ../downloaded_fasta_list.db3-db4.sort.txt.with-latlon > ../data/fish/lat-long-date.txt
awk -F'\t' '{print $1"\t1"}' ../data/fish/lat-long-date.txt > ../data/fish/mapwater.result.txt #このファイルでSRR IDが1であるものだけが表示対象（のはずだけど、develop版で有効かは忘れた）

cd ../update_scripts/blockSeparatingAndDataPreparing
for i in `seq 2 18`; do node --max-old-space-size=204800 01blockSeparatorForLevel2to18meta.js ja $i & done; wait
#このコマンドで../../public/layered_data/ja/の中にmitosearchで表示するために必要なファイルがおおよそ作られる。

awk -F'\t' '{if($0~"^id"){id=$2}else{print id"\t"$0}}' ../../mitosearch-bacteria-new/*.tsv > merge.tsv
node 02blockSeparatorForLevel18.js ja > srr-block.txt

awk -F'\t' -v path=../../public/layered_data/ja/0.0000858306884765625/ '
 FILENAME==ARGV[1]{for(i=1;i<=5;i++){a[$1][i]=$(i+1)}; a2[$7][$8][$1]=$2}
 FILENAME==ARGV[2]{b[$1][$2]=$3}
 END{
  for(i in a2){
   file=path""i"/eachData.json";
   print i; print "{" > file;
   n1=0
   for(j in a2[i]){
    n1++
    print " \""j"\": [" > file; PROCINFO["sorted_in"]="@val_str_asc";
    n2=0
    for(k in a2[i][j]){
     n2++
     print "  {\n   \"ID\":\""k"\",\n   \"time\":\""a2[i][j][k]"\",\n   \"lat\":\""a[k][2]"\",\n   \"long\":\""a[k][3]"\",\n   \"species\":{" > file;
     PROCINFO["sorted_in"]="@val_num_desc";
     n3=0
     for(h in b[k]){
      n3++
      if(n3<length(b[k])){print "    \""h"\":"b[k][h]"," > file}else{print "    \""h"\":"b[k][h] > file} #名前の長さ制限なしversion
      #if(n3<length(b[k])){print "    \""substr(h,length(h)-40)"\":"b[k][h]"," > file}else{print "    \""substr(h,length(h)-40)"\":"b[k][h] > file}
     };
     if(n2<length(a2[i][j])){print "   }\n  }," > file}else{print "   }\n  }" > file}
    };
    if(n1<length(a2[i])){print " ]," > file}else{print " ]" > file}
   };
   print "}" > file
   close(file)
  }
 }' srr-block.txt merge.tsv

#円グラフの色分けの定義ファイルを作成する
cd ../script
more ../blockSeparatingAndDataPreparing/merge.tsv |cut -f 2|sort|uniq > species.list
node grouping.js species.list
mv classifylist.txt ../../data/fish/classifylist_ja.txt

cd ../.. #mitosearch/Mitosearchフォルダに移動
npm start
```

以上のコマンドでmitosearchが起動する。http://localhost:3003/ でアクセス可能
