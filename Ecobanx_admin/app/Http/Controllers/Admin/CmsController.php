<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Blogs;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Factory as ValidatorFactory;



class CmsController extends Controller
{
    public function addBlog(Request $request){

        return view('Blog.add');
    }

    public function createBlog(Request $request){
        
        
        $validator = App::make('Illuminate\Validation\Factory')->make(
            $request->all(),[               
                'title' => 'required|regex:/^[a-zA-Z0-9\s]+$/',  
                'slug' => 'required|regex:/^[a-zA-Z0-9\s]+$/|unique:mysql2.blogs,slug',
                'body_of_blog' => 'required',
                'blog_image' => 'required|mimes:jpeg,png,jpg,gif,svg',
            ]
        );

        $verifier = App::make('validation.presence');
        $verifier->setConnection('mysql2');
        $validator->setPresenceVerifier($verifier);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        $photo = "";
        $phototwo = "";


        try {
            if(isset($request->blog_image)){
                $pho = $request->file('blog_image');
                $filenamewithextension = $pho->getClientOriginalName();
                $photnam = time(). str_replace('.', '', microtime(true));
                $filename = pathinfo($photnam, PATHINFO_FILENAME);
                $extension = $pho->getClientOriginalExtension();
                $phototwo = $filename . '.' . $extension;
                $path = 'images/colorimage/';
                $pho->move(public_path($path), $phototwo);
            }
        }catch (Exception $e) { 
            $phototwo = strtolower($request->blog_image).'.svg';
        }
        
        $data = new Blogs();
        $data->setConnection('mysql2');
        $data->title = $request->title;
        $data->slug = $request->slug;
        $data->body_of_blog = $request->body_of_blog;
        $data->blog_image = $phototwo;
        $data->created_at = date('Y-m-d h:i:s');
        $data->save();
        
        return redirect('admin/blogs-list')->with('status', 'Blog created successfully!');

    }

    public function listBlog(){
        
        $blog = Blogs::on('mysql2')->orderBy('id','desc')->paginate(20);
        return view('Blog.lists',['datas' => $blog]);
    }

    public function editBlog(Request $request,$id){
        
        $id = Crypt::decrypt($id);
        
        $blog = Blogs::on('mysql2')->where('id',$id)->first();
        
        return view('Blog.edit',['blog' => $blog]);

    }

    public function updateBlog(Request $request){
        
        $id = Crypt::decrypt($request->blog_id);

        $validator = App::make('Illuminate\Validation\Factory')->make(
            $request->all(),[               
                'title' => 'required|regex:/^[a-zA-Z0-9\s]+$/',  
                'slug' => 'required|regex:/^[a-zA-Z0-9\s]+$/|unique:mysql2.blogs,slug,'.$id,
                'body_of_blog' => 'required',
                'blog_image' => 'nullable|mimes:jpeg,png,jpg,gif,svg',
            ]
        );

        $verifier = App::make('validation.presence');
        $verifier->setConnection('mysql2');
        $validator->setPresenceVerifier($verifier);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $photo = "";
        $phototwo = "";
        

        try {
            if(isset($request->blog_image)){
                $pho = $request->file('blog_image');
                $filenamewithextension = $pho->getClientOriginalName();
                $photnam = time(). str_replace('.', '', microtime(true));
                $filename = pathinfo($photnam, PATHINFO_FILENAME);
                $extension = $pho->getClientOriginalExtension();
                $phototwo = $filename . '.' . $extension;
                $path = 'images/colorimage/';
                $pho->move(public_path($path), $phototwo);
            }
        }catch (Exception $e) { 
            $phototwo = strtolower($request->blog_image).'.svg';
        }

        $availableData = Blogs::where('id',$id)->first();
        
        $data = Blogs::on('mysql2')->where('id',$id)->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'body_of_blog' => $request->body_of_blog,
            'blog_image' => ($phototwo == "" ? $availableData->blog_image : $phototwo),
            'updated_at' => date('Y-m-d h:i:s'),
        ]);
        
        
        return redirect('admin/blogs-list')->with('status', 'Blog updated successfully!');
    }

    public function deleteBlog($id){

        $id = Crypt::decrypt($id);

        $data = Blogs::on('mysql2')->findOrFail($id);
        $delete = $data->delete();
        if($delete){
           return redirect()->back()->with('status', 'Blog deleted successfully!'); 
        }
        return redirect()->back()->with('error', 'Something went wrong try again later!');

    }
    
}
