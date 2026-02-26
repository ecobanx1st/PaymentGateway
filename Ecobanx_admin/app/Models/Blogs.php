<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blogs extends Model
{
    protected $connection ="mysql2";
    protected $table="blogs";

    
    protected $fillable=['id','title','metadescription','blog_key','og_image','slug','category','body_of_blog','blog_image','thumb_image','author'];
}
