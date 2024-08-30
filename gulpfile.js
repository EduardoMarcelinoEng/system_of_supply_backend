const { exec } = require('child_process');
const { src, dest } = require('gulp');
const gulp = require('gulp');
const dotenv = require('dotenv');
dotenv.config();

gulp.task('move-files', function () {
    return src(['__tests__/**/*.*'])
        .pipe(dest('build/__tests__'));
});

gulp.task('if-not-exists-create-network', async function (cb) {
    await new Promise((resolve, reject)=>{
        exec(`docker network inspect my_local_network`, function (err) {
            if(err){
                return exec(`docker network create --driver bridge my_local_network`, function (err2) {
                    if(err2) return reject("err2");
                    resolve(true);
                });
            }
            resolve(true);
        });
    })
        .then(()=>cb())
        .catch(err=>{
            console.log(`Não foi possível criar a rede my_local_network.`);
            throw new Error(err);
        });
});

gulp.task('build', gulp.series("move-files", "if-not-exists-create-network"));