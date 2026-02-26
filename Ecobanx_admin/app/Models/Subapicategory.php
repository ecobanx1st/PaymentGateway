<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subapicategory extends Model
{
    protected $connection = 'mysql2';
    protected $table ='sub_merchant_api';


 public static function index()
    {
        $forum = Subapicategory::paginate(10);

        return $forum;
    }

        public static function addforum($request)
        {
            $description = str_replace("\r\n",'', $request->description);
            $fourm = new Subapicategory();
            $fourm->cat_id  = $request->category;
            $fourm->sub_title  = $request->subcategory;
            $fourm->desc  = $description;
            $fourm->save();
            return true;

        }

    public static function view($id)
    {
        return Subapicategory::where('id',$id)->first();

    }

    public static function formupdate($request)
    {
        $description = str_replace("\r\n",'', $request->description);
        $fourm = Subapicategory::where('id', $request->id)->first();
        $fourm->cat_id  = $request->category;
        $fourm->sub_title  = $request->subcategory;
        $fourm->desc  = $description;
        $fourm->save();
        return true;   
    }

    public static function catdestroy($id)
    {    
           Subapicategory::on('mysql2')->where('id',$id)->delete();

           return 'Record deleted Successfully!';  
    }




  }
