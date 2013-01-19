class HomeController < ApplicationController
  def index
    redirect_to(schedule_url) unless access_token_expired?
  end
end
