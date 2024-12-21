```
git clone https://github.com/suikoucalender/mitosearch.git
cd mitosearch
git checkout develop
cd Mitosearch
npm install

cd /yoshitake/mitosearch-bacteria
awk -F'\t' 'FILENAME==ARGV[1]{a[$1]=1} FILENAME!=ARGV[1]{if(FNR==1){print FILENAME}; if($0~"^id"){if($2 in a){id=$2; split(FILENAME,arr,"/")}else{id=""}}; if(id!=""){print $0 > arr[length(arr)]}}' ~/work3/metasearch/2023/sra-20240219/downloaded_fasta_list.db3-db4.sort.txt.with-latlon ~/work3/metasearch/2023/db5-2-merge/merge2/*.tsv

for i in *.tsv; do mkdir -p ../mitosearch/Mitosearch/db_fish_ja/$i; done
for i in *.tsv; do awk -F'\t' '{if(FNR==1){print FILENAME}; if($0~"^id"){id=$2}; if(id!=""){print $0 > "../mitosearch/Mitosearch/db_fish_ja/"FILENAME"/"id".input"}}' $i; done 
for i in *.tsv; do awk -F'\t' '{if(FNR==1){print FILENAME > "/dev/stderr"}; if($0~"^id"){id=$2; print id"\t"FILENAME"/"id".input"}}' $i; done > ../mitosearch/Mitosearch/data/fish/input_file_path.txt  
more ~/work3/metasearch/2023/sra-20240219/downloaded_fasta_list.db3-db4.sort.txt.with-latlon|awk -F'\t' '{split($4,arr,"###"); print $1"\t"arr[5]"\t"arr[4]}' > ../mitosearch/Mitosearch/data/fish/lat-long-date.txt
more ../mitosearch/Mitosearch/data/fish/lat-long-date.txt|awk -F'\t' '{print $1"\t1"}' > ../mitosearch/Mitosearch/data/fish/mapwater.result.txt
#node --max-old-space-size=204800 01blockSeparatorForLevel1to17meta.js ja
cd /yoshitake/mitosearch/Mitosearch/update_scripts/blockSeparatingAndDataPreparing
for i in `seq 2 18`; do node --max-old-space-size=204800 01blockSeparatorForLevel2to18meta.js ja $i & done; wait

cd  /yoshitake/mitosearch/Mitosearch
npm start
```
